export type UpgradeOfferPricing = {
  upgradeBaseMinor: bigint;
  discountBps: number;
  discountMinor: bigint;
  finalPriceMinor: bigint;
};

// Real, hand-verified discount tiers - visit count determines the offer
// the customer sees, capped at the third-visit rate rather than
// escalating indefinitely. A visit beyond the third still gets the
// maximum defined discount, not a runaway percentage.
const VISIT_DISCOUNT_BPS: Record<number, number> = {
  1: 1000, // 10%
  2: 2500, // 25%
  3: 4000, // 40%
};
const MAX_DISCOUNT_BPS = 4000;

export function getDiscountBpsForVisit(visitNumber: number): number {
  if (visitNumber <= 0) return 0;
  return VISIT_DISCOUNT_BPS[visitNumber] ?? MAX_DISCOUNT_BPS;
}

// The real upgrade math: what a customer who already paid for a lower
// plan actually owes to reach the target plan, with the visit-based
// discount applied on top of the ALREADY-reduced upgrade cost - never on
// the full target price, since that would double-count what they've
// already paid.
export function computeUpgradeOffer(input: {
  targetPriceMinor: bigint;
  alreadyPaidMinor: bigint;
  visitNumber: number;
}): UpgradeOfferPricing {
  const upgradeBaseMinor =
    input.targetPriceMinor > input.alreadyPaidMinor
      ? input.targetPriceMinor - input.alreadyPaidMinor
      : 0n; // never a negative upgrade cost if somehow already paid more
  const discountBps = getDiscountBpsForVisit(input.visitNumber);
  const discountMinor = (upgradeBaseMinor * BigInt(discountBps)) / 10_000n;

  return {
    upgradeBaseMinor,
    discountBps,
    discountMinor,
    finalPriceMinor: upgradeBaseMinor - discountMinor,
  };
}

// The 4-hour urgency window, from the moment this specific offer/visit
// was shown - a real, checkable expiry, not a cosmetic countdown with no
// enforcement behind it.
export const OFFER_WINDOW_MS = 4 * 60 * 60 * 1000;

export function isOfferExpired(offerShownAt: Date, now: Date): boolean {
  return now.getTime() - offerShownAt.getTime() > OFFER_WINDOW_MS;
}
