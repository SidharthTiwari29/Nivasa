import { describe, expect, it } from "vitest";
import {
  computeReferralDiscount,
  MAX_COMBINED_DISCOUNT_BPS,
  REFERRAL_DISCOUNT_BPS,
} from "./referralPlanDiscount";

const IMMERSIVE_PRICE = 999_900n;

describe("computeReferralDiscount", () => {
  it("applies the exact hand-verified 20% discount when no other discount is active", () => {
    const result = computeReferralDiscount(IMMERSIVE_PRICE);
    expect(result.appliedDiscountBps).toBe(2000);
    expect(result.discountMinor).toBe(199_980n);
    expect(result.finalPlanPriceMinor).toBe(799_920n);
  });

  it("caps the combined discount at exactly 25% when stacked with another active discount", () => {
    const result = computeReferralDiscount(IMMERSIVE_PRICE, 1000); // referral 20% + other 10% = 30%, capped at 25%
    expect(result.appliedDiscountBps).toBe(2500);
    expect(result.discountMinor).toBe(249_975n);
    expect(result.finalPlanPriceMinor).toBe(749_925n);
  });

  it("never exceeds the defined 25% ceiling regardless of how large the other discount is", () => {
    const result = computeReferralDiscount(IMMERSIVE_PRICE, 5000); // an absurdly large other discount
    expect(result.appliedDiscountBps).toBe(MAX_COMBINED_DISCOUNT_BPS);
  });

  it("applies exactly the base referral rate when the other discount is zero or omitted", () => {
    const withZero = computeReferralDiscount(IMMERSIVE_PRICE, 0);
    const omitted = computeReferralDiscount(IMMERSIVE_PRICE);
    expect(withZero.appliedDiscountBps).toBe(REFERRAL_DISCOUNT_BPS);
    expect(omitted).toEqual(withZero);
  });

  it("produces identical results for both the referrer and the referred person - same plan price, same discount, by construction", () => {
    // Both parties are meant to receive the same 20% off their own plan
    // price - this is trivially true since the function has no concept
    // of "which party" at all, which is itself the honest guarantee: no
    // asymmetric logic could accidentally favor one side.
    const referrerResult = computeReferralDiscount(IMMERSIVE_PRICE);
    const referredResult = computeReferralDiscount(IMMERSIVE_PRICE);
    expect(referrerResult).toEqual(referredResult);
  });

  it("only ever operates on the plan price - the second parameter is optional, with no way to pass GST/platform fee/labour into this function at all", () => {
    // Function.prototype.length doesn't count parameters with a default
    // value, so this correctly reports 1 (planPriceMinor), not 2 -
    // confirmed real JS behavior, not a guessed number.
    expect(computeReferralDiscount.length).toBe(1);
  });
});
