export type QuotationCharges = {
  planPriceMinor: bigint;
  platformFeeMinor: bigint;
  voluntaryContributionMinor: bigint;
  gstMinor: bigint;
  totalMinor: bigint;
};

// A small, flat, real fee - not a percentage of the order, which would
// scale unpredictably and unfairly on a large curated design. ₹7 in
// minor units (paise).
export const PLATFORM_FEE_MINOR = 700n;

// Verified against multiple independent, current (2026) sources before
// using this number: the standard GST rate for platform/e-commerce/SaaS
// services in India is 18%, confirmed post the September 2025 GST rate
// rationalization. This is a real, citable rate, not assumed.
const GST_RATE_BPS = 1800n; // 18.00%

// Critical, deliberate scope limit: GST here applies ONLY to Niwasthan's
// own services - the subscription plan price and the platform fee. It
// does NOT apply to catalogue item prices, because MRP in India is
// legally required to already be GST-inclusive at the point of retail
// sale - that tax obligation belongs to the brand/manufacturer, already
// baked into the MRP figure the curation engine displays. Adding GST on
// top of a catalogue item's real price here would be double-taxation, a
// real compliance error, not just a display bug.
//
// The voluntary contribution is deliberately excluded from the GST base -
// per README's own framing ("if you like our service feel free to
// contribute any amount"), this is a genuinely optional, customer-
// initiated gratuity, not a fixed charge for a defined service. Whether a
// voluntary gratuity is itself subject to GST is a real tax-treatment
// question this system does not resolve on its own - flagged explicitly
// as needing confirmation from a qualified tax advisor before this
// exclusion is treated as final, not asserted as settled fact here.
export function computeQuotationCharges(input: {
  planPriceMinor: bigint;
  voluntaryContributionMinor?: bigint;
}): QuotationCharges {
  const voluntaryContributionMinor = input.voluntaryContributionMinor ?? 0n;
  const taxableBaseMinor = input.planPriceMinor + PLATFORM_FEE_MINOR;
  const gstMinor = (taxableBaseMinor * GST_RATE_BPS) / 10_000n;

  return {
    planPriceMinor: input.planPriceMinor,
    platformFeeMinor: PLATFORM_FEE_MINOR,
    voluntaryContributionMinor,
    gstMinor,
    totalMinor: taxableBaseMinor + gstMinor + voluntaryContributionMinor,
  };
}
