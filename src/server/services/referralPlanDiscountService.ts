import { referralRepository } from "@/server/repositories/referralRepository";

export type ReferralDiscountEligibility = {
  eligible: boolean;
  reason: string;
};

export const referralPlanDiscountService = {
  // Checks eligibility for the REFERRED party: they must have a real
  // referral relationship on record AND have genuinely converted to a
  // paid plan themselves - "goes with the interior with us" means an
  // actual purchase, not merely signing up through a referral link.
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

    return {
      eligible: true,
      reason: "Real referral relationship with a genuine paid conversion",
    };
  },

  // Checks eligibility for the REFERRER: their own code must have
  // produced at least one referred person who has genuinely converted.
  // The referrer's own discount depends entirely on someone else's real
  // action, never assumed just because a code exists or was ever used.
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
      const hasConverted =
        await referralRepository.hasActivePaidPlan(referredUserId);
      if (hasConverted) {
        return {
          eligible: true,
          reason: "At least one referred person has genuinely converted",
        };
      }
    }

    return {
      eligible: false,
      reason: "Referred people exist, but none have purchased a paid plan yet",
    };
  },
};
