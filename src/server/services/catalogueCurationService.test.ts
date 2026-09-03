import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { curationRecommendationRepository } from "@/server/repositories/curationRecommendationRepository";
import { createBoq } from "@/server/services/boqService";
import { reconcileBoqWithBudget } from "@/server/services/boqBudgetIntegration";
import { catalogueCurationService } from "./catalogueCurationService";

vi.mock("@/server/repositories/catalogueCurationRepository", () => ({
  catalogueCurationRepository: {
    findActiveOptionsByCategories: vi.fn(),
  },
}));
vi.mock("@/server/repositories/curationRecommendationRepository", () => ({
  curationRecommendationRepository: {
    findProjectForOwner: vi.fn(),
    createRecommendation: vi.fn(),
    findRecommendationForOwner: vi.fn(),
    claimCommit: vi.fn(),
    attachResultingBoq: vi.fn(),
  },
}));
vi.mock("@/server/services/boqService", () => ({
  createBoq: vi.fn(),
}));
vi.mock("@/server/services/boqBudgetIntegration", () => ({
  reconcileBoqWithBudget: vi.fn(),
}));

const optionsRepo = vi.mocked(catalogueCurationRepository);
const recRepo = vi.mocked(curationRecommendationRepository);
const boqCreate = vi.mocked(createBoq);
const reconcile = vi.mocked(reconcileBoqWithBudget);

describe("catalogueCurationService.curate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes through to the real curation engine using real fetched options", async () => {
    optionsRepo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "sofa-a",
              name: "Sofa A",
              brand: "Brand A",
              unitPriceMinor: 20_000n,
              mrpMinor: 24_000n,
              priceEffectiveFrom: new Date("2026-08-25T00:00:00Z"),
              warrantyMonths: null,
            },
          ],
        ],
      ]),
    );

    const result = await catalogueCurationService.curate(
      [{ category: "sofa", quantity: 1 }],
      50_000n,
    );

    expect(optionsRepo.findActiveOptionsByCategories).toHaveBeenCalledWith([
      "sofa",
    ]);
    expect(result.selections[0].itemId).toBe("sofa-a");
    expect(result.withinBudget).toBe(true);
  });
});

describe("catalogueCurationService.recommend", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the project does not exist or is not owned by the caller", async () => {
    recRepo.findProjectForOwner.mockResolvedValue(null);

    await expect(
      catalogueCurationService.recommend(
        "project-1",
        "user-1",
        [{ category: "sofa", quantity: 1 }],
        50_000n,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(optionsRepo.findActiveOptionsByCategories).not.toHaveBeenCalled();
  });

  it("persists a real recommendation at status RECOMMENDED - not committed into any BOQ yet", async () => {
    recRepo.findProjectForOwner.mockResolvedValue({ id: "project-1" } as never);
    optionsRepo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "sofa-a",
              name: "Sofa A",
              brand: "Brand A",
              unitPriceMinor: 20_000n,
              mrpMinor: null,
              priceEffectiveFrom: new Date(),
              warrantyMonths: null,
            },
          ],
        ],
      ]),
    );
    recRepo.createRecommendation.mockResolvedValue({
      id: "rec-1",
      status: "RECOMMENDED",
    } as never);

    const result = await catalogueCurationService.recommend(
      "project-1",
      "user-1",
      [{ category: "sofa", quantity: 1 }],
      50_000n,
    );

    expect(result).toEqual({ id: "rec-1", status: "RECOMMENDED" });
    expect(boqCreate).not.toHaveBeenCalled();
  });
});

describe("catalogueCurationService.commit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the recommendation does not exist or is not owned by the caller", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue(null);

    await expect(
      catalogueCurationService.commit("rec-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(recRepo.claimCommit).not.toHaveBeenCalled();
  });

  it("rejects committing a recommendation that is already committed", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue({
      id: "rec-1",
      status: "COMMITTED",
    } as never);

    await expect(
      catalogueCurationService.commit("rec-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(recRepo.claimCommit).not.toHaveBeenCalled();
  });

  it("claims the commit BEFORE creating any BOQ - never creates a BOQ if the claim is lost", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue({
      id: "rec-1",
      status: "RECOMMENDED",
      projectId: "project-1",
      selections: [],
    } as never);
    recRepo.claimCommit.mockResolvedValue(false); // lost the race

    await expect(
      catalogueCurationService.commit("rec-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(boqCreate).not.toHaveBeenCalled();
  });

  it("creates a real BOQ from the recommendation's selections once the commit is claimed", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue({
      id: "rec-1",
      status: "RECOMMENDED",
      projectId: "project-1",
      selections: [
        {
          itemId: "sofa-a",
          itemName: "Sofa A",
          unitPriceMinor: "20000",
          quantity: 1,
        },
      ],
    } as never);
    recRepo.claimCommit.mockResolvedValue(true);
    boqCreate.mockResolvedValue({ id: "boq-1" } as never);

    const boq = await catalogueCurationService.commit("rec-1", "user-1");

    expect(boq).toEqual({ id: "boq-1" });
    expect(boqCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: "user-1",
        projectId: "project-1",
        lines: [
          expect.objectContaining({
            catalogueItemId: "sofa-a",
            description: "Sofa A",
            quantity: 1n,
            unitPriceMinor: 20_000n,
          }),
        ],
      }),
    );
    expect(recRepo.attachResultingBoq).toHaveBeenCalledWith("rec-1", "boq-1");
  });

  it("automatically reconciles the real BOQ against the customer's budget after a successful commit", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue({
      id: "rec-1",
      status: "RECOMMENDED",
      projectId: "project-1",
      selections: [
        {
          itemId: "sofa-a",
          itemName: "Sofa A",
          unitPriceMinor: "20000",
          quantity: 1,
        },
      ],
    } as never);
    recRepo.claimCommit.mockResolvedValue(true);
    boqCreate.mockResolvedValue({ id: "boq-1", version: 3 } as never);
    reconcile.mockResolvedValue({ id: "impact-1" } as never);

    await catalogueCurationService.commit("rec-1", "user-1");

    expect(reconcile).toHaveBeenCalledWith({
      ownerId: "user-1",
      projectId: "project-1",
      boqVersion: 3,
    });
  });

  it("never lets a reconciliation failure undo or block an already-created BOQ - a customer without a formal budget yet is a legitimate case, not an error", async () => {
    recRepo.findRecommendationForOwner.mockResolvedValue({
      id: "rec-1",
      status: "RECOMMENDED",
      projectId: "project-1",
      selections: [],
    } as never);
    recRepo.claimCommit.mockResolvedValue(true);
    boqCreate.mockResolvedValue({ id: "boq-1", version: 1 } as never);
    reconcile.mockRejectedValue(new Error("BUDGET_VERSION_NOT_FOUND"));

    await expect(
      catalogueCurationService.commit("rec-1", "user-1"),
    ).resolves.toEqual({ id: "boq-1", version: 1 });
  });
});
