import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: { entitlement: { findMany: vi.fn() } },
}));

const db = vi.mocked(prisma, { deep: true });

describe("featureAccessService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("hasFeature", () => {
    it("returns true when an active entitlement's plan includes the feature", async () => {
      db.entitlement.findMany.mockResolvedValue([
        { package: { code: "NIWASTHAN_COMPLETE" } },
      ] as never);
      const { featureAccessService } = await import("./featureAccessService");

      expect(
        await featureAccessService.hasFeature("user-1", "procurement"),
      ).toBe(true);
    });

    it("returns false when no active entitlement's plan includes the feature", async () => {
      db.entitlement.findMany.mockResolvedValue([
        { package: { code: "FREE" } },
      ] as never);
      const { featureAccessService } = await import("./featureAccessService");

      expect(
        await featureAccessService.hasFeature("user-1", "procurement"),
      ).toBe(false);
    });

    it("only queries ACTIVE, unexpired entitlements", async () => {
      db.entitlement.findMany.mockResolvedValue([]);
      const { featureAccessService } = await import("./featureAccessService");

      await featureAccessService.hasFeature("user-1", "procurement");

      const call = db.entitlement.findMany.mock.calls[0][0];
      expect(call?.where).toMatchObject({ userId: "user-1", status: "ACTIVE" });
    });
  });

  describe("requireFeature", () => {
    it("throws ForbiddenError when the feature is not included in any held plan", async () => {
      db.entitlement.findMany.mockResolvedValue([
        { package: { code: "FREE" } },
      ] as never);
      const { featureAccessService } = await import("./featureAccessService");

      await expect(
        featureAccessService.requireFeature("user-1", "procurement"),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("resolves without throwing when the feature is included", async () => {
      db.entitlement.findMany.mockResolvedValue([
        { package: { code: "NIWASTHAN_IMMERSIVE" } },
      ] as never);
      const { featureAccessService } = await import("./featureAccessService");

      await expect(
        featureAccessService.requireFeature("user-1", "procurement"),
      ).resolves.toBeUndefined();
    });
  });
});
