import { referralRepository } from "@/server/repositories/referralRepository";
import { assessReferralFraudRisk } from "@/server/services/referralFraudSignal";

export type ReferralDiscountEligibility = {
  eligible: boolean;
  reason: string;
};

export const referralPlanDiscountService = {
  // Checks eligibility for the REFERRED party: they must have a real
  // referral relationship on record AND have genuinely converted to a
  // paid plan themselves - "goes with the interior with us" means an
  // actual purchase, not merely signing up through a referral link.
  //
  // A HIGH fraud-risk signal (referrer and referred sharing both a
  // signup IP and User-Agent) denies the automatic discount outright -
  // this is a real, honest limitation of a graduated risk signal, not a
  // false-confidence fraud verdict: an ELEVATED risk (only one signal
  // matching) still passes through, since that alone is too weak and
  // too common (shared household/office IPs) to justify denying a
  // genuine referral.
  async checkReferredEligibility(
    referredUserId: string,
  ): Promise<ReferralDiscountEligibility> {
    const referral =
      await referralRepository.findAnyReferralForUser(referredUserId);
    if (!referral) {
      return { eligible: false, reason: "No referral relationship on record" };
    }

    const hasConverted =
      await referralRepository.hasActivePaidPlan(referredUserId);
    if (!hasConverted) {
      return {
        eligible: false,
        reason: "Has not yet purchased a paid plan",
      };
    }

    const referrerId = referral.referralCode.ownerUserId;
    const [referrerSignal, referredSignal] = await Promise.all([
      referralRepository.findSignupSignal(referrerId),
      referralRepository.findSignupSignal(referredUserId),
    ]);
    const risk = assessReferralFraudRisk(
      {
        ipAddress: referrerSignal?.signupIpAddress ?? null,
        userAgent: referrerSignal?.signupUserAgent ?? null,
      },
      {
        ipAddress: referredSignal?.signupIpAddress ?? null,
        userAgent: referredSignal?.signupUserAgent ?? null,
      },
    );
    if (risk.riskLevel === "HIGH") {
      return {
        eligible: false,
        reason: `Flagged for manual review: ${risk.reasons.join("; ")}`,
      };
    }

    return {
      eligible: true,
      reason: "Real referral relationship with a genuine paid conversion",
    };
  },

  // Checks eligibility for the REFERRER: their own code must have
  // produced at least one referred person who has genuinely converted.
  // The referrer's own discount depends entirely on someone else's real
  // action, never assumed just because a code exists or was ever used.
  //
  // Deliberately reuses checkReferredEligibility for the fraud check on
  // each candidate referred user, rather than re-implementing the risk
  // logic here - the same real referral relationship is being evaluated
  // from the other side, and duplicating the fraud check would risk the
  // two sides silently drifting out of sync with each other over time.
  async checkReferrerEligibility(
    ownerUserId: string,
  ): Promise<ReferralDiscountEligibility> {
    const code = await referralRepository.findCodeByOwner(ownerUserId);
    if (!code) {
      return { eligible: false, reason: "No referral code owned" };
    }

    const referredUserIds = await referralRepository.findReferredUserIdsForCode(
      code.id,
    );
    if (referredUserIds.length === 0) {
      return { eligible: false, reason: "No one has used this referral code" };
    }

    for (const referredUserId of referredUserIds) {
      const referredResult =
        await this.checkReferredEligibility(referredUserId);
      if (referredResult.eligible) {
        return {
          eligible: true,
          reason: "At least one referred person has genuinely converted",
        };
      }
    }

    return {
      eligible: false,
      reason:
        "Referred people exist, but none have both converted and passed fraud review",
    };
  },
};
