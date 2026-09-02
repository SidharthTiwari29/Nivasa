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

  it("NIWASTHAN_DESIGN adds before/after and panorama but not 3D or walkthrough", () => {
    expect(planIncludesRenderType("NIWASTHAN_DESIGN", "BEFORE_AFTER")).toBe(
      true,
    );
    expect(planIncludesRenderType("NIWASTHAN_DESIGN", "PANORAMA")).toBe(true);
    expect(planIncludesRenderType("NIWASTHAN_DESIGN", "THREE_D_SCENE")).toBe(
      false,
    );
    expect(planIncludesRenderType("NIWASTHAN_DESIGN", "WALKTHROUGH")).toBe(
      false,
    );
  });

  it("NIWASTHAN_COMPLETE adds the full 3D scene but not walkthrough/video", () => {
    expect(planIncludesRenderType("NIWASTHAN_COMPLETE", "THREE_D_SCENE")).toBe(
      true,
    );
    expect(planIncludesRenderType("NIWASTHAN_COMPLETE", "WALKTHROUGH")).toBe(
      false,
    );
    expect(planIncludesRenderType("NIWASTHAN_COMPLETE", "VIDEO")).toBe(false);
  });

  it("NIWASTHAN_IMMERSIVE is the only plan that unlocks the signature walkthrough/video experience", () => {
    expect(planIncludesRenderType("NIWASTHAN_IMMERSIVE", "WALKTHROUGH")).toBe(
      true,
    );
    expect(planIncludesRenderType("NIWASTHAN_IMMERSIVE", "VIDEO")).toBe(true);
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
    const tiers = [
      "FREE",
      "NIWASTHAN_DESIGN",
      "NIWASTHAN_COMPLETE",
      "NIWASTHAN_IMMERSIVE",
    ];

    for (const type of renderTypes) {
      let seenTrue = false;
      for (const tier of tiers) {
        const included = planIncludesRenderType(tier, type);
        if (included) seenTrue = true;
        // Once a capability appears at some tier, every higher tier must
        // also include it - this catches an accidental regression in the
        // mapping table (e.g. someone editing NIWASTHAN_COMPLETE and
        // forgetting to also add the entry to NIWASTHAN_IMMERSIVE).
        if (seenTrue) expect(included).toBe(true);
      }
    }
  });
});

describe("anyPlanIncludesRenderType", () => {
  it("grants access if any held plan includes the render type", () => {
    expect(
      anyPlanIncludesRenderType(["FREE", "NIWASTHAN_IMMERSIVE"], "WALKTHROUGH"),
    ).toBe(true);
  });

  it("denies access when no held plan includes the render type", () => {
    expect(
      anyPlanIncludesRenderType(["FREE", "NIWASTHAN_DESIGN"], "WALKTHROUGH"),
    ).toBe(false);
  });
});

describe("plansIncludingRenderType", () => {
  it("lists exactly the plans that unlock the walkthrough experience", () => {
    expect(plansIncludingRenderType("WALKTHROUGH")).toEqual([
      "NIWASTHAN_IMMERSIVE",
    ]);
  });

  it("lists every plan that includes the base design image", () => {
    const plans = plansIncludingRenderType("DESIGN_IMAGE");
    expect(plans).toContain("FREE");
    expect(plans).toContain("NIWASTHAN_IMMERSIVE");
    expect(plans).toHaveLength(5); // FREE + 4 paid tiers, including HOME_INTELLIGENCE
  });
});
