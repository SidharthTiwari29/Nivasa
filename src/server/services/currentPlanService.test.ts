import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { getCurrentPlan } from "./currentPlanService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    entitlement: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("getCurrentPlan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the real, honest Free plan when no active entitlement exists at all", async () => {
    db.entitlement.findFirst.mockResolvedValue(null);

    const result = await getCurrentPlan("user-1");

    expect(result).toEqual({
      packageCode: "FREE",
      packageName: "Free",
      creditsRemaining: 0,
      creditsTotal: 0,
    });
  });

  it("returns the real, most recent active entitlement's package and hand-verified remaining credits", async () => {
    db.entitlement.findFirst.mockResolvedValue({
      creditsTotal: 100,
      creditsReserved: 10,
      creditsConsumed: 25,
      package: { code: "NIWASTHAN_COMPLETE", name: "Niwasthan Complete" },
    } as never);

    const result = await getCurrentPlan("user-1");

    expect(result.packageCode).toBe("NIWASTHAN_COMPLETE");
    expect(result.packageName).toBe("Niwasthan Complete");
    // Hand-verified: 100 - 10 - 25 = 65
    expect(result.creditsRemaining).toBe(65);
    expect(result.creditsTotal).toBe(100);
  });

  it("only ever considers ACTIVE entitlements, never an expired or cancelled one", async () => {
    db.entitlement.findFirst.mockResolvedValue(null);

    await getCurrentPlan("user-1");

    expect(db.entitlement.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", status: "ACTIVE" },
      }),
    );
  });
});
