import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "@/server/errors/AppError";
import { floorPlanRepository } from "@/server/repositories/floorPlanRepository";
import { floorPlanService } from "./floorPlanService";

vi.mock("@/server/repositories/floorPlanRepository", () => ({
  floorPlanRepository: {
    findPropertyForOwner: vi.fn(),
    findAssetForOwner: vi.fn(),
    findLatestVersion: vi.fn(),
    create: vi.fn(),
    findByIdForOwner: vi.fn(),
    listForOwner: vi.fn(),
  },
}));

const repository = vi.mocked(floorPlanRepository);

describe("floorPlanService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a floor plan for a property the user does not own", async () => {
    repository.findPropertyForOwner.mockResolvedValue(null);

    await expect(
      floorPlanService.create("user-1", {
        propertyId: "property-1",
        assetId: "asset-1",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an asset outside the user's storage namespace", async () => {
    repository.findPropertyForOwner.mockResolvedValue({ id: "property-1" });
    repository.findAssetForOwner.mockResolvedValue(null);

    await expect(
      floorPlanService.create("user-1", {
        propertyId: "property-1",
        assetId: "asset-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("creates the next immutable floor plan version", async () => {
    repository.findPropertyForOwner.mockResolvedValue({ id: "property-1" });
    repository.findAssetForOwner.mockResolvedValue({ id: "asset-1" });
    repository.findLatestVersion.mockResolvedValue({ version: 3 });
    repository.create.mockResolvedValue({ id: "floor-plan-4" } as never);

    await floorPlanService.create("user-1", {
      propertyId: "property-1",
      assetId: "asset-1",
    });

    expect(repository.create).toHaveBeenCalledWith(
      { propertyId: "property-1", assetId: "asset-1" },
      4,
    );
  });
});
