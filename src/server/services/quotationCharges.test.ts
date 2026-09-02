import { describe, expect, it } from "vitest";
import {
  computeQuotationCharges,
  PLATFORM_FEE_MINOR,
} from "./quotationCharges";

describe("computeQuotationCharges", () => {
  it("matches the hand-verified reference calculation exactly", () => {
    // Niwasthan Design plan: ₹99 = 9,900 paise. Platform fee: ₹7 = 700 paise.
    // Taxable base = 10,600. GST at 18% = 1,908. Total = 12,508 paise.
    const result = computeQuotationCharges({ planPriceMinor: 9_900n });

    expect(result.platformFeeMinor).toBe(700n);
    expect(result.gstMinor).toBe(1_908n);
    expect(result.totalMinor).toBe(12_508n);
  });

  it("always includes the flat ₹7 platform fee regardless of plan price", () => {
    const result = computeQuotationCharges({ planPriceMinor: 999_00n });
    expect(result.platformFeeMinor).toBe(PLATFORM_FEE_MINOR);
    expect(result.platformFeeMinor).toBe(700n);
  });

  it("charges GST on the plan price and platform fee, never on the voluntary contribution", () => {
    const withContribution = computeQuotationCharges({
      planPriceMinor: 9_900n,
      voluntaryContributionMinor: 5_000n, // a ₹50 tip
    });
    const withoutContribution = computeQuotationCharges({
      planPriceMinor: 9_900n,
    });

    // GST must be identical whether or not a voluntary contribution was
    // added - the contribution never enters the taxable base.
    expect(withContribution.gstMinor).toBe(withoutContribution.gstMinor);
    // But the total correctly includes the contribution as extra.
    expect(withContribution.totalMinor).toBe(
      withoutContribution.totalMinor + 5_000n,
    );
  });

  it("defaults the voluntary contribution to zero when not provided", () => {
    const result = computeQuotationCharges({ planPriceMinor: 9_900n });
    expect(result.voluntaryContributionMinor).toBe(0n);
  });

  it("handles a zero plan price (e.g. the FREE tier) correctly - GST still applies to the platform fee alone", () => {
    const result = computeQuotationCharges({ planPriceMinor: 0n });
    // Taxable base = 0 + 700 = 700. GST at 18% = 126 (700 * 0.18 = 126).
    expect(result.gstMinor).toBe(126n);
    expect(result.totalMinor).toBe(826n);
  });

  it("never adds GST or platform fee twice regardless of how many times the function is called with the same input", () => {
    const a = computeQuotationCharges({ planPriceMinor: 99_900n });
    const b = computeQuotationCharges({ planPriceMinor: 99_900n });
    expect(a).toEqual(b);
  });
});
