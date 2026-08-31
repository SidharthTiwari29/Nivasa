export type QualityTier = "STANDARD" | "HD";

// The actual cost-control decision: STANDARD uses the free-tier-eligible
// model (Gemini 2.5 Flash Image / "Nano Banana" - up to 500 free
// images/day as of this writing); HD uses the paid-only, higher-quality
// model (Gemini 3 Pro Image / "Nano Banana Pro" - no free tier at all,
// billed per image). Defaulting to STANDARD unless a specific, justified
// reason exists to pay for HD is the entire cost-management strategy for
// visualization - most renders should never touch the paid path.
//
// HD is only justified when:
// 1. The room understanding backing this design is CONFIRMED and
//    high-confidence (matches computeVisualizationPriority's threshold) -
//    paying for a premium render of data that might be wrong/unconfirmed
//    would be spending money on a result likely to be redone anyway.
// 2. The user's plan includes priority_visualization (the Pro tier) - the
//    same plan-to-feature gate already enforced elsewhere, so HD spend
//    only happens for users whose plan is priced to cover it.
export function decideQualityTier(input: {
  roomConfirmedHighConfidence: boolean;
  planIncludesPriorityVisualization: boolean;
}): QualityTier {
  if (
    input.roomConfirmedHighConfidence &&
    input.planIncludesPriorityVisualization
  ) {
    return "HD";
  }
  return "STANDARD";
}
