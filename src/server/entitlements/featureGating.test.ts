import { describe, expect, it } from "vitest";
import { anyPlanIncludesFeature, planIncludesFeature } from "./featureGating";

describe("planIncludesFeature", () => {
  it("FREE plan includes no gated features", () => {
    expect(planIncludesFeature("FREE", "ai_design_generation")).toBe(false);
    expect(planIncludesFeature("FREE", "procurement")).toBe(false);
  });

  it("NIWASTHAN_DESIGN unlocks AI design generation but not procurement", () => {
    expect(
      planIncludesFeature("NIWASTHAN_DESIGN", "ai_design_generation"),
    ).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_DESIGN", "procurement")).toBe(false);
  });

  it("NIWASTHAN_COMPLETE unlocks procurement and negotiation but not priority visualization", () => {
    expect(planIncludesFeature("NIWASTHAN_COMPLETE", "procurement")).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_COMPLETE", "quote_negotiation")).toBe(
      true,
    );
    expect(
      planIncludesFeature("NIWASTHAN_COMPLETE", "priority_visualization"),
    ).toBe(false);
  });

  it("NIWASTHAN_IMMERSIVE unlocks every defined feature", () => {
    expect(
      planIncludesFeature("NIWASTHAN_IMMERSIVE", "ai_design_generation"),
    ).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_IMMERSIVE", "budget_export")).toBe(
      true,
    );
    expect(
      planIncludesFeature("NIWASTHAN_IMMERSIVE", "priority_visualization"),
    ).toBe(true);
  });

  it("returns false for an unknown plan code rather than throwing", () => {
    expect(planIncludesFeature("SOME_UNKNOWN_CODE", "procurement")).toBe(false);
  });
});

describe("anyPlanIncludesFeature", () => {
  it("grants access if any one held plan includes the feature", () => {
    // A user who bought Design, then separately bought Complete, should
    // not lose procurement access just because Design alone lacks it.
    expect(
      anyPlanIncludesFeature(
        ["NIWASTHAN_DESIGN", "NIWASTHAN_COMPLETE"],
        "procurement",
      ),
    ).toBe(true);
  });

  it("denies access when no held plan includes the feature", () => {
    expect(
      anyPlanIncludesFeature(["FREE", "NIWASTHAN_DESIGN"], "procurement"),
    ).toBe(false);
  });

  it("denies access for an empty entitlement list", () => {
    expect(anyPlanIncludesFeature([], "ai_design_generation")).toBe(false);
  });
});

describe("niwasthan_magic gating", () => {
  it("is reserved for the two highest tiers, not the lower-priced plans", () => {
    expect(planIncludesFeature("FREE", "niwasthan_magic")).toBe(false);
    expect(planIncludesFeature("NIWASTHAN_DESIGN", "niwasthan_magic")).toBe(
      false,
    );
    expect(planIncludesFeature("NIWASTHAN_COMPLETE", "niwasthan_magic")).toBe(
      false,
    );
  });

  it("is included on Home Intelligence and Immersive", () => {
    expect(
      planIncludesFeature("NIWASTHAN_HOME_INTELLIGENCE", "niwasthan_magic"),
    ).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_IMMERSIVE", "niwasthan_magic")).toBe(
      true,
    );
  });
});
