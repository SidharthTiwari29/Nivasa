import { describe, expect, it } from "vitest";
import { anyPlanIncludesFeature, planIncludesFeature } from "./featureGating";

describe("planIncludesFeature", () => {
  it("FREE plan includes no gated features", () => {
    expect(planIncludesFeature("FREE", "ai_design_generation")).toBe(false);
    expect(planIncludesFeature("FREE", "procurement")).toBe(false);
  });

  it("NIVASA_DESIGN unlocks AI design generation but not procurement", () => {
    expect(planIncludesFeature("NIVASA_DESIGN", "ai_design_generation")).toBe(
      true,
    );
    expect(planIncludesFeature("NIVASA_DESIGN", "procurement")).toBe(false);
  });

  it("NIVASA_COMPLETE unlocks procurement and negotiation but not priority visualization", () => {
    expect(planIncludesFeature("NIVASA_COMPLETE", "procurement")).toBe(true);
    expect(planIncludesFeature("NIVASA_COMPLETE", "quote_negotiation")).toBe(
      true,
    );
    expect(
      planIncludesFeature("NIVASA_COMPLETE", "priority_visualization"),
    ).toBe(false);
  });

  it("NIVASA_PRO unlocks every defined feature", () => {
    expect(planIncludesFeature("NIVASA_PRO", "ai_design_generation")).toBe(
      true,
    );
    expect(planIncludesFeature("NIVASA_PRO", "budget_export")).toBe(true);
    expect(planIncludesFeature("NIVASA_PRO", "priority_visualization")).toBe(
      true,
    );
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
        ["NIVASA_DESIGN", "NIVASA_COMPLETE"],
        "procurement",
      ),
    ).toBe(true);
  });

  it("denies access when no held plan includes the feature", () => {
    expect(
      anyPlanIncludesFeature(["FREE", "NIVASA_DESIGN"], "procurement"),
    ).toBe(false);
  });

  it("denies access for an empty entitlement list", () => {
    expect(anyPlanIncludesFeature([], "ai_design_generation")).toBe(false);
  });
});
