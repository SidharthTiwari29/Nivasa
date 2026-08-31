import { describe, expect, it } from "vitest";
import {
  anyPlanIncludesRenderType,
  planIncludesRenderType,
  plansIncludingRenderType,
} from "./renderTierGating";

describe("planIncludesRenderType", () => {
  it("FREE plan only includes a static design image", () => {
    expect(planIncludesRenderType("FREE", "DESIGN_IMAGE")).toBe(true);
    expect(planIncludesRenderType("FREE", "PANORAMA")).toBe(false);
    expect(planIncludesRenderType("FREE", "WALKTHROUGH")).toBe(false);
    expect(planIncludesRenderType("FREE", "VIDEO")).toBe(false);
  });

  it("NIVASA_DESIGN adds before/after and panorama but not 3D or walkthrough", () => {
    expect(planIncludesRenderType("NIVASA_DESIGN", "BEFORE_AFTER")).toBe(true);
    expect(planIncludesRenderType("NIVASA_DESIGN", "PANORAMA")).toBe(true);
    expect(planIncludesRenderType("NIVASA_DESIGN", "THREE_D_SCENE")).toBe(
      false,
    );
    expect(planIncludesRenderType("NIVASA_DESIGN", "WALKTHROUGH")).toBe(false);
  });

  it("NIVASA_COMPLETE adds the full 3D scene but not walkthrough/video", () => {
    expect(planIncludesRenderType("NIVASA_COMPLETE", "THREE_D_SCENE")).toBe(
      true,
    );
    expect(planIncludesRenderType("NIVASA_COMPLETE", "WALKTHROUGH")).toBe(
      false,
    );
    expect(planIncludesRenderType("NIVASA_COMPLETE", "VIDEO")).toBe(false);
  });

  it("NIVASA_PRO is the only plan that unlocks the signature walkthrough/video experience", () => {
    expect(planIncludesRenderType("NIVASA_PRO", "WALKTHROUGH")).toBe(true);
    expect(planIncludesRenderType("NIVASA_PRO", "VIDEO")).toBe(true);
  });

  it("returns false for an unknown plan code rather than throwing", () => {
    expect(planIncludesRenderType("SOME_UNKNOWN_CODE", "DESIGN_IMAGE")).toBe(
      false,
    );
  });

  it("every higher tier is a strict superset of the tier below it (no plan loses a capability a lower plan has)", () => {
    const renderTypes: Array<
      "DESIGN_IMAGE" | "BEFORE_AFTER" | "PANORAMA" | "THREE_D_SCENE"
    > = ["DESIGN_IMAGE", "BEFORE_AFTER", "PANORAMA", "THREE_D_SCENE"];
    const tiers = ["FREE", "NIVASA_DESIGN", "NIVASA_COMPLETE", "NIVASA_PRO"];

    for (const type of renderTypes) {
      let seenTrue = false;
      for (const tier of tiers) {
        const included = planIncludesRenderType(tier, type);
        if (included) seenTrue = true;
        // Once a capability appears at some tier, every higher tier must
        // also include it - this catches an accidental regression in the
        // mapping table (e.g. someone editing NIVASA_COMPLETE and
        // forgetting to also add the entry to NIVASA_PRO).
        if (seenTrue) expect(included).toBe(true);
      }
    }
  });
});

describe("anyPlanIncludesRenderType", () => {
  it("grants access if any held plan includes the render type", () => {
    expect(
      anyPlanIncludesRenderType(["FREE", "NIVASA_PRO"], "WALKTHROUGH"),
    ).toBe(true);
  });

  it("denies access when no held plan includes the render type", () => {
    expect(
      anyPlanIncludesRenderType(["FREE", "NIVASA_DESIGN"], "WALKTHROUGH"),
    ).toBe(false);
  });
});

describe("plansIncludingRenderType", () => {
  it("lists exactly the plans that unlock the walkthrough experience", () => {
    expect(plansIncludingRenderType("WALKTHROUGH")).toEqual(["NIVASA_PRO"]);
  });

  it("lists every plan that includes the base design image", () => {
    const plans = plansIncludingRenderType("DESIGN_IMAGE");
    expect(plans).toContain("FREE");
    expect(plans).toContain("NIVASA_PRO");
    expect(plans).toHaveLength(4);
  });
});
