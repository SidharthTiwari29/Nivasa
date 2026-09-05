// Canonical plan-to-feature mapping. Keep this table synchronized with
// src/server/payments/packages.ts. Historical package codes remain readable
// so existing customers do not lose paid access.
export type FeatureKey =
  | "ai_design_generation"
  | "procurement"
  | "quote_negotiation"
  | "budget_export"
  | "priority_visualization"
  | "niwasthan_finds"
  | "niwasthan_magic"
  | "immersive_walkthrough";

const PLAN_FEATURES: Record<string, readonly FeatureKey[]> = {
  // ₹199 — Discover your home.
  NIWASTHAN_STARTER: ["ai_design_generation"],

  // ₹999 — Design your home.
  NIWASTHAN_DESIGN: [
    "ai_design_generation",
    "niwasthan_finds",
    "niwasthan_magic",
  ],

  // ₹2,599 — Plan your home with confidence.
  NIWASTHAN_HOME_BOOK: [
    "ai_design_generation",
    "niwasthan_finds",
    "niwasthan_magic",
    "budget_export",
    "procurement",
    "quote_negotiation",
  ],

  // ₹9,999 — Enter your future home.
  NIWASTHAN_IMMERSIVE: [
    "ai_design_generation",
    "procurement",
    "quote_negotiation",
    "niwasthan_finds",
    "budget_export",
    "priority_visualization",
    "niwasthan_magic",
    "immersive_walkthrough",
  ],

  // Historical plans: never sell these again, but preserve existing
  // entitlements for customers who already purchased them.
  FREE: [],
  NIWASTHAN_COMPLETE: [
    "ai_design_generation",
    "procurement",
    "quote_negotiation",
    "niwasthan_finds",
    "niwasthan_magic",
    "budget_export",
  ],
  NIWASTHAN_HOME_INTELLIGENCE: [
    "ai_design_generation",
    "procurement",
    "quote_negotiation",
    "niwasthan_finds",
    "budget_export",
    "niwasthan_magic",
  ],
};

export function planIncludesFeature(
  packageCode: string,
  feature: FeatureKey,
): boolean {
  return (PLAN_FEATURES[packageCode] ?? []).includes(feature);
}

export function anyPlanIncludesFeature(
  packageCodes: readonly string[],
  feature: FeatureKey,
): boolean {
  return packageCodes.some((code) => planIncludesFeature(code, feature));
}
