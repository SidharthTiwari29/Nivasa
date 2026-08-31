export type QualityTier = "STANDARD" | "HD";

// The actual cost-control decision: STANDARD uses the free-tier-eligible
// model (Gemini 2.5 Flash Image / "Nano Banana" - up to 500 free
// images/day as of this writing); HD uses the paid-only, higher-quality
// model (Gemini 3 Pro Image / "Nano Banana Pro" - no free tier at all,
// billed per image). Defaulting to STANDARD unless a specific, justified
// reason exists to pay for HD is the entire cost-management strategy for
// visualization - most renders should never touch the paid path.
//
// HD is justified in exactly two independent cases:
// 1. An unused onboarding grant exists - the trust-building mechanism:
//    every user's first-ever render is HD regardless of plan, a bounded
//    one-time cost meant to demonstrate quality before any payment, not a
//    recurring discount.
// 2. The room understanding backing this design is CONFIRMED and
//    high-confidence AND the user's plan includes priority_visualization
//    - paying for the premium model on unconfirmed data, or for a user
//    whose plan isn't priced to cover it, is exactly the spend this
//    function exists to prevent.
export function decideQualityTier(input: {
  roomConfirmedHighConfidence: boolean;
  planIncludesPriorityVisualization: boolean;
  hasUnusedOnboardingGrant?: boolean;
}): QualityTier {
  if (input.hasUnusedOnboardingGrant) {
    return "HD";
  }

  if (
    input.roomConfirmedHighConfidence &&
    input.planIncludesPriorityVisualization
  ) {
    return "HD";
  }
  return "STANDARD";
}
