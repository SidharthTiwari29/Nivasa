import { beforeEach, describe, expect, it, vi } from "vitest";
import { referralRepository } from "@/server/repositories/referralRepository";
import { referralPlanDiscountService } from "./referralPlanDiscountService";

vi.mock("@/server/repositories/referralRepository", () => ({
  referralRepository: {
    findAnyReferralForUser: vi.fn(),
    hasActivePaidPlan: vi.fn(),
    findCodeByOwner: vi.fn(),
    findReferredUserIdsForCode: vi.fn(),
    findSignupSignal: vi.fn(),
  },
}));

const repo = vi.mocked(referralRepository);

const NO_SIGNAL = { signupIpAddress: null, signupUserAgent: null };

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
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-1",
      referralCode: { ownerUserId: "referrer-1" },
    } as never);
    repo.hasActivePaidPlan.mockResolvedValue(false);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("not yet purchased");
  });

  it("is eligible when referred, genuinely converted, and no fraud signal is present", async () => {
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-1",
      referralCode: { ownerUserId: "referrer-1" },
    } as never);
    repo.hasActivePaidPlan.mockResolvedValue(true);
    repo.findSignupSignal.mockResolvedValue(NO_SIGNAL as never);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(true);
  });

  it("denies eligibility when referrer and referred share BOTH signup IP and User-Agent - the HIGH fraud risk case", async () => {
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-1",
      referralCode: { ownerUserId: "referrer-1" },
    } as never);
    repo.hasActivePaidPlan.mockResolvedValue(true);
    repo.findSignupSignal.mockResolvedValue({
      signupIpAddress: "1.1.1.1",
      signupUserAgent: "Chrome/A",
    } as never);

    const result =
      await referralPlanDiscountService.checkReferredEligibility("user-1");

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Flagged for manual review");
  });

  it("still grants eligibility when only ONE fraud signal matches (ELEVATED, not HIGH) - too weak alone to deny a genuine referral", async () => {
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-1",
      referralCode: { ownerUserId: "referrer-1" },
    } as never);
    repo.hasActivePaidPlan.mockResolvedValue(true);
    repo.findSignupSignal
      .mockResolvedValueOnce({
        signupIpAddress: "1.1.1.1",
        signupUserAgent: "Chrome/A",
      } as never) // referrer
      .mockResolvedValueOnce({
        signupIpAddress: "1.1.1.1",
        signupUserAgent: "Firefox/B",
      } as never); // referred - only IP matches

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
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-x",
      referralCode: { ownerUserId: "user-1" },
    } as never);
    repo.hasActivePaidPlan.mockResolvedValue(false);

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(false);
  });

  it("is eligible when at least one of several referred people has genuinely converted and passes fraud review", async () => {
    repo.findCodeByOwner.mockResolvedValue({ id: "code-1" } as never);
    repo.findReferredUserIdsForCode.mockResolvedValue([
      "ref-user-1",
      "ref-user-2",
    ]);
    repo.findAnyReferralForUser.mockResolvedValue({
      id: "ref-x",
      referralCode: { ownerUserId: "user-1" },
    } as never);
    repo.hasActivePaidPlan
      .mockResolvedValueOnce(false) // first referred user hasn't converted
      .mockResolvedValueOnce(true); // second one has
    repo.findSignupSignal.mockResolvedValue(NO_SIGNAL as never);

    const result =
      await referralPlanDiscountService.checkReferrerEligibility("user-1");

    expect(result.eligible).toBe(true);
  });
});
