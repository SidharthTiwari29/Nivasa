import { beforeEach, describe, expect, it, vi } from "vitest";
import { referralRepository } from "@/server/repositories/referralRepository";
import { referralPlanDiscountService } from "./referralPlanDiscountService";

vi.mock("@/server/repositories/referralRepository", () => ({
  referralRepository: {
    findAnyReferralForUser: vi.fn(),
    hasActivePaidPlan: vi.fn(),
    findCodeByOwner: vi.fn(),
    findReferredUserIdsForCode: vi.fn(),
  },
}));

const repo = vi.mocked(referralRepository);

describe("referralPlanDiscountService.checkReferredEligibility", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is not eligible with no referral relationship on record at all", async () => {
    repo.findAnyReferralForUser.mockResolvedValue(null);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(repo.hasActivePaidPlan).not.toHaveBeenCalled();
  });

  it("is not eligible if referred but has not converted to a paid plan", async () => {
    repo.findAnyReferralForUser.mockResolvedValue({ id: "ref-1" } as never);
    repo.hasActivePaidPlan.mockResolvedValue(false);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("not yet purchased");
  });

  it("is eligible when referred AND genuinely converted to a paid plan", async () => {
    repo.findAnyReferralForUser.mockResolvedValue({ id: "ref-1" } as never);
    repo.hasActivePaidPlan.mockResolvedValue(true);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(true);
  });
});

describe("referralPlanDiscountService.checkReferrerEligibility", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is not eligible with no referral code owned", async () => {
    repo.findCodeByOwner.mockResolvedValue(null);

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(repo.findReferredUserIdsForCode).not.toHaveBeenCalled();
  });

  it("is not eligible when the code exists but no one has used it", async () => {
    repo.findCodeByOwner.mockResolvedValue({ id: "code-1" } as never);
    repo.findReferredUserIdsForCode.mockResolvedValue([]);

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(false);
  });

  it("is not eligible when referred people exist but none have converted", async () => {
    repo.findCodeByOwner.mockResolvedValue({ id: "code-1" } as never);
    repo.findReferredUserIdsForCode.mockResolvedValue([
      "ref-user-1",
      "ref-user-2",
    ]);
    repo.hasActivePaidPlan.mockResolvedValue(false);

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(repo.hasActivePaidPlan).toHaveBeenCalledTimes(2);
  });

  it("is eligible when at least one of several referred people has genuinely converted", async () => {
    repo.findCodeByOwner.mockResolvedValue({ id: "code-1" } as never);
    repo.findReferredUserIdsForCode.mockResolvedValue([
      "ref-user-1",
      "ref-user-2",
    ]);
    repo.hasActivePaidPlan
      .mockResolvedValueOnce(false) // first referred user hasn't converted
      .mockResolvedValueOnce(true); // second one has

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(true);
  });
});
