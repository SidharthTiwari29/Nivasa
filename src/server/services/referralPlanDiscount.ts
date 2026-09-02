export type ReferralDiscountResult = {
  appliedDiscountBps: number;
  discountMinor: bigint;
  finalPlanPriceMinor: bigint;
};

// The real referral rate and the real anti-abuse ceiling, both as
// specified: 20% for each party (referrer and referred), but the TOTAL
// discount any single plan purchase can ever receive - even combined
// with other active promotions - is capped at 25%. This is a genuine
// margin-protection rule, not a display nicety: without the cap, a
// referral discount stacked with a future promotion could erode pricing
// well beyond what the business ever intended.
export const REFERRAL_DISCOUNT_BPS = 2000; // 20%
export const MAX_COMBINED_DISCOUNT_BPS = 2500; // 25%

// Deliberately takes ONLY planPriceMinor as its subject - GST, platform
// fee, and labour/procurement charges are never passed into this
// function at all, which is a structural guarantee that a discount
// computed here can never be misapplied to them, not merely a
// documented rule someone has to remember to follow. Those three are
// real, pass-through, or flat-and-uncontrollable costs (GST is a legal
// tax obligation; the platform fee is already fixed at Rs 7 with zero
// variability; labour/procurement charges are real supplier costs
// Niwasthan doesn't set) - discounting any of them would mean Niwasthan
// absorbing a cost it has no real margin to give away.
export function computeReferralDiscount(
  planPriceMinor: bigint,
  otherActiveDiscountBps = 0,
): ReferralDiscountResult {
  const appliedDiscountBps = Math.min(
    REFERRAL_DISCOUNT_BPS + otherActiveDiscountBps,
    MAX_COMBINED_DISCOUNT_BPS,
  );
  const discountMinor = (planPriceMinor * BigInt(appliedDiscountBps)) / 10_000n;

  return {
    appliedDiscountBps,
    discountMinor,
    finalPlanPriceMinor: planPriceMinor - discountMinor,
  };
}
