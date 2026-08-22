import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { floorPlanRepository } from "@/server/repositories/floorPlanRepository";
import { assertAssetOwner } from "./assetAuthorization";
import { floorPlanService } from "./floorPlanService";

vi.mock("@/server/repositories/floorPlanRepository", () => ({
  floorPlanRepository: {
    findPropertyForOwner: vi.fn(),
    findLatestVersion: vi.fn(),
    create: vi.fn(),
    findByIdForOwner: vi.fn(),
    listForOwner: vi.fn(),
  },
}));

vi.mock("./assetAuthorization", () => ({
  assertAssetOwner: vi.fn(),
}));

const repository = vi.mocked(floorPlanRepository);
const ownership = vi.mocked(assertAssetOwner);

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

    expect(ownership).not.toHaveBeenCalled();
  });

  it("delegates asset ownership to the canonical resolver", async () => {
    repository.findPropertyForOwner.mockResolvedValue({ id: "property-1" });
    ownership.mockRejectedValueOnce(new Error("ownership rejected"));

    await expect(
      floorPlanService.create("user-1", {
        propertyId: "property-1",
        assetId: "asset-1",
      }),
    ).rejects.toThrow("ownership rejected");

    expect(ownership).toHaveBeenCalledWith("asset-1", "user-1");
    expect(repository.findLatestVersion).not.toHaveBeenCalled();
  });

  it("creates the next immutable floor plan version", async () => {
    repository.findPropertyForOwner.mockResolvedValue({ id: "property-1" });
    repository.findLatestVersion.mockResolvedValue({ version: 3 });
    repository.create.mockResolvedValue({ id: "floor-plan-4" } as never);

    await floorPlanService.create("user-1", {
      propertyId: "property-1",
      assetId: "asset-1",
    });

    expect(ownership).toHaveBeenCalledWith("asset-1", "user-1");
    expect(repository.create).toHaveBeenCalledWith(
      { propertyId: "property-1", assetId: "asset-1" },
      4,
    );
  });
});
