import type { RenderType } from "@/server/rendering/provider";

// The concrete plan structure: what a customer actually SEES improves at
// each tier, not an abstract feature flag. This directly matches the
// product narrative - "free gets you a picture, our top plan gets you
// walking through your own apartment" - and README §25's signature
// experience (walkthrough/video) is deliberately reserved for the top
// tier, since it's the most expensive to produce and the most compelling
// reason to upgrade.
//
// Package codes below MUST match src/server/payments/packages.ts exactly
// - see the same warning in featureGating.ts, which went stale once
// already for the same reason (keyed on old NIVASA_* codes after
// packages.ts had already moved to NIWASTHAN_*).
const PLAN_RENDER_TYPES: Record<string, readonly RenderType[]> = {
  FREE: ["DESIGN_IMAGE"],
  NIWASTHAN_DESIGN: ["DESIGN_IMAGE", "BEFORE_AFTER", "PANORAMA"],
  NIWASTHAN_COMPLETE: [
    "DESIGN_IMAGE",
    "BEFORE_AFTER",
    "PANORAMA",
    "THREE_D_SCENE",
  ],
  NIWASTHAN_HOME_INTELLIGENCE: [
    "DESIGN_IMAGE",
    "BEFORE_AFTER",
    "PANORAMA",
    "THREE_D_SCENE",
  ],
  NIWASTHAN_IMMERSIVE: [
    "DESIGN_IMAGE",
    "BEFORE_AFTER",
    "PANORAMA",
    "THREE_D_SCENE",
    "WALKTHROUGH",
    "VIDEO",
  ],
};

export function planIncludesRenderType(
  packageCode: string,
  renderType: RenderType,
): boolean {
  return (PLAN_RENDER_TYPES[packageCode] ?? []).includes(renderType);
}

// Same "any held entitlement, not just the latest purchase" reasoning as
// anyPlanIncludesFeature - a user who upgraded from Design to Pro should
// not lose access to render types their original purchase already
// unlocked, and should immediately gain access to everything Pro adds.
export function anyPlanIncludesRenderType(
  packageCodes: readonly string[],
  renderType: RenderType,
): boolean {
  return packageCodes.some((code) => planIncludesRenderType(code, renderType));
}

// For a plan-upgrade prompt: "unlock the full walkthrough experience by
// upgrading to Pro" needs to know which plan(s) actually include a given
// render type, not just whether the current one does.
export function plansIncludingRenderType(
  renderType: RenderType,
): readonly string[] {
  return Object.entries(PLAN_RENDER_TYPES)
    .filter(([, types]) => types.includes(renderType))
    .map(([code]) => code);
}
