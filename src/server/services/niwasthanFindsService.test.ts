import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { niwasthanFindsRepository } from "@/server/repositories/niwasthanFindsRepository";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { notificationService } from "@/server/services/notificationService";
import { featureAccessService } from "@/server/entitlements/featureAccessService";
import { niwasthanFindsService } from "./niwasthanFindsService";

vi.mock("@/server/repositories/niwasthanFindsRepository", () => ({
  niwasthanFindsRepository: { findSelectedItemForOwner: vi.fn() },
}));
vi.mock("@/server/repositories/catalogueCurationRepository", () => ({
  catalogueCurationRepository: { findActiveOptionsByCategories: vi.fn() },
}));
vi.mock("@/server/services/notificationService", () => ({
  notificationService: { notify: vi.fn() },
}));
vi.mock("@/server/entitlements/featureAccessService", () => ({
  featureAccessService: { requireFeature: vi.fn() },
}));

const findsRepo = vi.mocked(niwasthanFindsRepository);
const curationRepo = vi.mocked(catalogueCurationRepository);
const notifications = vi.mocked(notificationService);
const access = vi.mocked(featureAccessService);

describe("niwasthanFindsService.scanForBetterOption", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    access.requireFeature.mockResolvedValue(undefined);
  });

  it("checks plan access before doing anything else", async () => {
    access.requireFeature.mockRejectedValue(new Error("FORBIDDEN"));

    await expect(
      niwasthanFindsService.scanForBetterOption("line-1", "user-1"),
    ).rejects.toThrow("FORBIDDEN");
    expect(findsRepo.findSelectedItemForOwner).not.toHaveBeenCalled();
  });

  it("rejects when the BOQ line does not exist or is not owned by the caller", async () => {
    findsRepo.findSelectedItemForOwner.mockResolvedValue(null);

    await expect(
      niwasthanFindsService.scanForBetterOption("line-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a line item with no catalogue link - nothing real to scan against", async () => {
    findsRepo.findSelectedItemForOwner.mockResolvedValue({
      catalogueItemId: null,
      catalogueItem: null,
    } as never);

    await expect(
      niwasthanFindsService.scanForBetterOption("line-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("returns null and sends no notification when no cheaper real alternative exists", async () => {
    findsRepo.findSelectedItemForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: { category: "sofa" },
      description: "Selected Sofa",
      unitPriceMinor: 20_000n,
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
          ],
        ],
      ]),
    );

    const result = await niwasthanFindsService.scanForBetterOption(
      "line-1",
      "user-1",
    );

    expect(result).toBeNull();
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  it("finds the real cheaper alternative and sends a real notification", async () => {
    findsRepo.findSelectedItemForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: { category: "sofa" },
      description: "Selected Sofa",
      unitPriceMinor: 20_000n,
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
              name: "Cheaper Sofa",
              brand: "B",
              unitPriceMinor: 15_000n,
            },
          ],
        ],
      ]),
    );

    const result = await niwasthanFindsService.scanForBetterOption(
      "line-1",
      "user-1",
    );

    expect(result).not.toBeNull();
    expect(result?.savingMinor).toBe(5_000n);
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: "BETTER_ALTERNATIVE_FOUND",
      }),
    );
  });

  it("picks the cheapest of multiple real alternatives, not just the first one found", async () => {
    findsRepo.findSelectedItemForOwner.mockResolvedValue({
      catalogueItemId: "item-1",
      catalogueItem: { category: "sofa" },
      description: "Selected Sofa",
      unitPriceMinor: 20_000n,
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
              name: "Somewhat Cheaper",
              brand: "B",
              unitPriceMinor: 18_000n,
            },
            {
              itemId: "item-3",
              name: "Much Cheaper",
              brand: "C",
              unitPriceMinor: 12_000n,
            },
          ],
        ],
      ]),
    );

    const result = await niwasthanFindsService.scanForBetterOption(
      "line-1",
      "user-1",
    );

    expect(result?.alternativeName).toBe("Much Cheaper");
    expect(result?.savingMinor).toBe(8_000n);
  });
});
