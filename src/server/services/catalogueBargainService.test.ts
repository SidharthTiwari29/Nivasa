import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { catalogueBargainRepository } from "@/server/repositories/catalogueBargainRepository";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { catalogueBargainService } from "./catalogueBargainService";

vi.mock("@/server/repositories/catalogueBargainRepository", () => ({
  catalogueBargainRepository: {
    findLineForOwner: vi.fn(),
    updateLinePrice: vi.fn(),
  },
}));
vi.mock("@/server/repositories/catalogueCurationRepository", () => ({
  catalogueCurationRepository: { findActiveOptionsByCategories: vi.fn() },
}));

const bargainRepo = vi.mocked(catalogueBargainRepository);
const curationRepo = vi.mocked(catalogueCurationRepository);

describe("catalogueBargainService.proposePrice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the line does not exist or is not owned by the caller", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue(null);

    await expect(
      catalogueBargainService.proposePrice("line-1", "user-1", 20_000n),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a line with no catalogue link at all", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: null,
      catalogueItem: null,
    } as never);

    await expect(
      catalogueBargainService.proposePrice("line-1", "user-1", 20_000n),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects a catalogue item with no real current price on record", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: { category: "sofa", prices: [] },
    } as never);

    await expect(
      catalogueBargainService.proposePrice("line-1", "user-1", 20_000n),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("accepts a genuine offer at the real discounted floor, applying it and recomputing the line total using the real formula", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: {
        category: "sofa",
        prices: [{ amountMinor: 20_000n, mrpMinor: 24_000n }],
      },
      quantity: { toString: () => "2" },
      materialMinor: 5_000n,
      labourMinor: 3_000n,
    } as never);

    const outcome = await catalogueBargainService.proposePrice(
      "line-1",
      "user-1",
      20_000n,
    );

    expect(outcome.decision).toBe("ACCEPTED");
    // Hand-verified: 2 * 20,000 + 5,000 + 3,000 = 48,000.
    expect(bargainRepo.updateLinePrice).toHaveBeenCalledWith(
      "line-1",
      20_000n,
      48_000n,
    );
  });

  it("finds and offers a real, genuinely cheaper alternative when the proposal is below the floor and one exists", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: {
        category: "sofa",
        prices: [{ amountMinor: 20_000n, mrpMinor: 20_000n }], // no standing discount
      },
      quantity: { toString: () => "1" },
      materialMinor: 0n,
      labourMinor: 0n,
    } as never);
    curationRepo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "item-1",
              name: "Selected Sofa",
              brand: "A",
              unitPriceMinor: 20_000n,
            },
            {
              itemId: "item-2",
              name: "Budget Sofa",
              brand: "B",
              unitPriceMinor: 15_000n,
            },
          ],
        ],
      ]),
    );

    const outcome = await catalogueBargainService.proposePrice(
      "line-1",
      "user-1",
      15_000n,
    );

    expect(outcome.decision).toBe("REJECTED");
    if (outcome.decision === "REJECTED") {
      expect(outcome.alternative).toEqual({
        itemId: "item-2",
        name: "Budget Sofa",
        brand: "B",
        unitPriceMinor: 15_000n,
      });
    }
    expect(bargainRepo.updateLinePrice).not.toHaveBeenCalled();
  });

  it("picks the cheapest of multiple matching alternatives, not just the first one found", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: {
        category: "sofa",
        prices: [{ amountMinor: 20_000n, mrpMinor: 20_000n }],
      },
      quantity: { toString: () => "1" },
      materialMinor: 0n,
      labourMinor: 0n,
    } as never);
    curationRepo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "item-1",
              name: "Selected",
              brand: "A",
              unitPriceMinor: 20_000n,
            },
            {
              itemId: "item-2",
              name: "Somewhat Cheaper",
              brand: "B",
              unitPriceMinor: 14_000n,
            },
            {
              itemId: "item-3",
              name: "Cheapest Match",
              brand: "C",
              unitPriceMinor: 10_000n,
            },
          ],
        ],
      ]),
    );

    const outcome = await catalogueBargainService.proposePrice(
      "line-1",
      "user-1",
      15_000n,
    );

    expect(outcome.decision).toBe("REJECTED");
    if (outcome.decision === "REJECTED") {
      expect(outcome.alternative?.itemId).toBe("item-3");
    }
  });

  it("returns a genuinely null alternative when no real match exists - never fabricates one", async () => {
    bargainRepo.findLineForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: {
        category: "sofa",
        prices: [{ amountMinor: 20_000n, mrpMinor: 20_000n }],
      },
      quantity: { toString: () => "1" },
      materialMinor: 0n,
      labourMinor: 0n,
    } as never);
    curationRepo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "item-1",
              name: "Selected",
              brand: "A",
              unitPriceMinor: 20_000n,
            },
          ],
        ],
      ]),
    );

    const outcome = await catalogueBargainService.proposePrice(
      "line-1",
      "user-1",
      5_000n,
    );

    expect(outcome.decision).toBe("REJECTED");
    if (outcome.decision === "REJECTED") {
      expect(outcome.alternative).toBeNull();
    }
  });
});
