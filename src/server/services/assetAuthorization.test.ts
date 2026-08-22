import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  assertAssetOwner,
  buildAssetObjectKey,
  resolveAssetOwnerId,
  validateAssetObjectKey,
} from "./assetAuthorization";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    asset: {
      findUnique: vi.fn(),
    },
  },
}));

const findUnique = vi.mocked(prisma.asset.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("asset ownership authorization", () => {
  it("resolves ownership through a floor plan property", async () => {
    findUnique.mockResolvedValue({
      floorPlans: [{ property: { ownerId: "user-a" } }],
      designVersion: null,
      job: null,
    } as never);

    await expect(resolveAssetOwnerId("asset-1")).resolves.toBe("user-a");
    await expect(
      assertAssetOwner("asset-1", "user-a"),
    ).resolves.toBeUndefined();
  });

  it("denies a different user", async () => {
    findUnique.mockResolvedValue({
      floorPlans: [{ property: { ownerId: "user-a" } }],
      designVersion: null,
      job: null,
    } as never);

    await expect(assertAssetOwner("asset-1", "user-b")).rejects.toThrow(
      "You do not have access to this resource",
    );
  });

  it("rejects an orphan asset with no ownership path", async () => {
    findUnique.mockResolvedValue({
      floorPlans: [],
      designVersion: null,
      job: null,
    } as never);

    await expect(resolveAssetOwnerId("asset-1")).rejects.toThrow(
      "Asset has no resolvable owner",
    );
  });

  it("rejects conflicting ownership paths", async () => {
    findUnique.mockResolvedValue({
      floorPlans: [{ property: { ownerId: "user-a" } }],
      designVersion: { project: { ownerId: "user-b" } },
      job: null,
    } as never);

    await expect(resolveAssetOwnerId("asset-1")).rejects.toThrow(
      "Asset has conflicting ownership",
    );
  });
});

describe("asset object keys", () => {
  it("builds an owner-namespaced key", () => {
    expect(buildAssetObjectKey("user-a", "property-1", "asset-1")).toBe(
      "users/user-a/properties/property-1/assets/asset-1",
    );
  });

  it.each([
    "../secret",
    "users/../secret",
    "/absolute/path",
    "\\absolute\\path",
    "C:\\secret",
  ])("rejects unsafe object key %s", (objectKey) => {
    expect(() => validateAssetObjectKey(objectKey)).toThrow(
      "Request validation failed",
    );
  });
});
