import { describe, expect, it } from "vitest";
import {
  computeUpgradeOffer,
  getDiscountBpsForVisit,
  isOfferExpired,
  OFFER_WINDOW_MS,
} from "./planUpgradeOffer";

// Real prices from packages.ts: NIWASTHAN_IMMERSIVE 999,900 paise,
// NIWASTHAN_DESIGN 9,900 paise. Upgrade base = 990,000 paise (Rs 9,900).
const TARGET = 999_900n;
const ALREADY_PAID = 9_900n;

describe("computeUpgradeOffer", () => {
  it("computes the exact hand-verified first-visit offer (10% off)", () => {
    const result = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 1,
    });
    expect(result.upgradeBaseMinor).toBe(990_000n);
    expect(result.discountMinor).toBe(99_000n);
    expect(result.finalPriceMinor).toBe(891_000n);
  });

  it("computes the exact hand-verified second-visit offer (25% off)", () => {
    const result = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 2,
    });
    expect(result.discountMinor).toBe(247_500n);
    expect(result.finalPriceMinor).toBe(742_500n);
  });

  it("computes the exact hand-verified third-visit offer (40% off)", () => {
    const result = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 3,
    });
    expect(result.discountMinor).toBe(396_000n);
    expect(result.finalPriceMinor).toBe(594_000n);
  });

  it("caps the discount at the third-visit rate for any later visit, never escalating further", () => {
    const visit3 = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 3,
    });
    const visit10 = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 10,
    });
    expect(visit10.discountBps).toBe(visit3.discountBps);
    expect(visit10.finalPriceMinor).toBe(visit3.finalPriceMinor);
  });

  it("applies zero discount for a visit number of zero or less", () => {
    const result = computeUpgradeOffer({
      targetPriceMinor: TARGET,
      alreadyPaidMinor: ALREADY_PAID,
      visitNumber: 0,
    });
    expect(result.discountBps).toBe(0);
    expect(result.finalPriceMinor).toBe(result.upgradeBaseMinor);
  });

  it("never produces a negative upgrade base if already paid exceeds the target (a data anomaly, handled safely)", () => {
    const result = computeUpgradeOffer({
      targetPriceMinor: 9_900n,
      alreadyPaidMinor: 99_900n,
      visitNumber: 1,
    });
    expect(result.upgradeBaseMinor).toBe(0n);
    expect(result.finalPriceMinor).toBe(0n);
  });
});

describe("getDiscountBpsForVisit", () => {
  it("returns the exact real tiers for visits 1, 2, and 3", () => {
    expect(getDiscountBpsForVisit(1)).toBe(1000);
    expect(getDiscountBpsForVisit(2)).toBe(2500);
    expect(getDiscountBpsForVisit(3)).toBe(4000);
  });
});

describe("isOfferExpired", () => {
  const shownAt = new Date("2026-09-01T10:00:00Z");

  it("is not expired well within the 4-hour window", () => {
    const now = new Date(shownAt.getTime() + 60 * 60 * 1000); // 1 hour later
    expect(isOfferExpired(shownAt, now)).toBe(false);
  });

  it("is not expired at exactly 4 hours (the boundary is exclusive)", () => {
    const now = new Date(shownAt.getTime() + OFFER_WINDOW_MS);
    expect(isOfferExpired(shownAt, now)).toBe(false);
  });

  it("is expired just past the 4-hour window", () => {
    const now = new Date(shownAt.getTime() + OFFER_WINDOW_MS + 1);
    expect(isOfferExpired(shownAt, now)).toBe(true);
  });
});
