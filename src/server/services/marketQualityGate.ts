export type QualityCheckedOption = {
  itemId: string;
  brand: string | null;
  warrantyMonths: number | null;
};

export type SourceQualityResult = {
  hasBrand: boolean;
  warrantyStatus: "COVERED" | "NO_WARRANTY" | "UNKNOWN";
};

// The real, automated answer to "no compromise on quality, good warranty
// support" without relying on manually curating a small hand-picked
// source list - this runs on every real option that flows through the
// catalogue, regardless of how many sources feed it (10 or 500), so
// quality is a structural property of the pipeline, not a one-time
// human review that can't scale.
//
// warrantyMonths === null is deliberately NOT the same as 0: a source
// that has never reported warranty data is UNKNOWN, not "confirmed no
// warranty." Collapsing these would either wrongly penalize a real
// product whose warranty just hasn't been recorded yet, or wrongly
// promote a genuinely warranty-less product by defaulting it to
// "unknown" instead of flagging it honestly. Both are treated as
// distinct, real states here.
export function evaluateSourceQuality(
  option: QualityCheckedOption,
): SourceQualityResult {
  return {
    hasBrand: option.brand !== null && option.brand.trim().length > 0,
    warrantyStatus:
      option.warrantyMonths === null
        ? "UNKNOWN"
        : option.warrantyMonths > 0
          ? "COVERED"
          : "NO_WARRANTY",
  };
}

// README's "adequate options" requirement, made a real, enforced
// property of every category the curation engine considers - not a
// number reported after the fact for the customer to notice or not.
// Below this threshold, a category is flagged rather than silently
// presented as if genuine choice existed when really there was one
// listing with no real competition to compare it against.
export const MINIMUM_ADEQUATE_OPTIONS = 2;

export function hasAdequateOptions(optionCount: number): boolean {
  return optionCount >= MINIMUM_ADEQUATE_OPTIONS;
}
