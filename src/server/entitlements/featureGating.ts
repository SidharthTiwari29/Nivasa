// Default plan-to-feature mapping - a real decision was needed here and
// none was given explicitly, so this is a documented, adjustable default,
// not a guess buried in code. Change this table to change what each plan
// unlocks; nothing else needs to change to adjust the gating.
export type FeatureKey =
  | "ai_design_generation"
  | "procurement"
  | "quote_negotiation"
  | "budget_export"
  | "priority_visualization";

const PLAN_FEATURES: Record<string, readonly FeatureKey[]> = {
  FREE: [],
  NIVASA_DESIGN: ["ai_design_generation"],
  NIVASA_COMPLETE: ["ai_design_generation", "procurement", "quote_negotiation"],
  NIVASA_PRO: [
    "ai_design_generation",
    "procurement",
    "quote_negotiation",
    "budget_export",
    "priority_visualization",
  ],
};

export function planIncludesFeature(
  packageCode: string,
  feature: FeatureKey,
): boolean {
  return (PLAN_FEATURES[packageCode] ?? []).includes(feature);
}

// A user may hold entitlements from multiple past purchases (e.g. bought
// Design, later upgraded to Pro) - access to a feature is granted if ANY
// active entitlement's plan includes it, not just the most recent
// purchase. This avoids incorrectly locking out a feature a user already
// paid for just because they later bought a different, unrelated package.
export function anyPlanIncludesFeature(
  packageCodes: readonly string[],
  feature: FeatureKey,
): boolean {
  return packageCodes.some((code) => planIncludesFeature(code, feature));
}
