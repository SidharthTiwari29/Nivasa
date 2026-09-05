import { describe, expect, it } from "vitest";
import { anyPlanIncludesFeature, planIncludesFeature } from "./featureGating";

describe("planIncludesFeature", () => {
  it("Starter unlocks home/design intelligence but not procurement", () => {
    expect(
      planIncludesFeature("NIWASTHAN_STARTER", "ai_design_generation"),
    ).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_STARTER", "procurement")).toBe(false);
  });

  it("Design unlocks design plus Finds/Magic but not procurement", () => {
    expect(
      planIncludesFeature("NIWASTHAN_DESIGN", "ai_design_generation"),
    ).toBe(true);
    expect(planIncludesFeature("NIWASTHAN_DESIGN", "niwasthan_finds")).toBe(
      true,
    );
    expect(planIncludesFeature("NIWASTHAN_DESIGN", "niwasthan_magic")).toBe(
      true,
    );
    expect(planIncludesFeature("NIWASTHAN_DESIGN", "procurement")).toBe(false);
  });

  it("Home Book unlocks budget export and procurement but not immersive", () => {
    expect(planIncludesFeature("NIWASTHAN_HOME_BOOK", "budget_export")).toBe(
      true,
    );
    expect(planIncludesFeature("NIWASTHAN_HOME_BOOK", "procurement")).toBe(
      true,
    );
    expect(
      planIncludesFeature("NIWASTHAN_HOME_BOOK", "immersive_walkthrough"),
    ).toBe(false);
  });

  it("only Immersive unlocks the real immersive walkthrough", () => {
    expect(
      planIncludesFeature("NIWASTHAN_IMMERSIVE", "immersive_walkthrough"),
    ).toBe(true);
    expect(
      planIncludesFeature("NIWASTHAN_HOME_BOOK", "immersive_walkthrough"),
    ).toBe(false);
    expect(
      planIncludesFeature("NIWASTHAN_DESIGN", "immersive_walkthrough"),
    ).toBe(false);
    expect(
      planIncludesFeature("NIWASTHAN_STARTER", "immersive_walkthrough"),
    ).toBe(false);
  });

  it("Immersive unlocks every defined feature", () => {
    const features = [
      "ai_design_generation",
      "procurement",
      "quote_negotiation",
      "budget_export",
      "priority_visualization",
      "niwasthan_finds",
      "niwasthan_magic",
      "immersive_walkthrough",
    ] as const;

    for (const feature of features) {
      expect(planIncludesFeature("NIWASTHAN_IMMERSIVE", feature)).toBe(true);
    }
  });

  it("returns false for an unknown plan code rather than throwing", () => {
    expect(planIncludesFeature("SOME_UNKNOWN_CODE", "procurement")).toBe(false);
  });

  it("preserves access for historical package codes", () => {
    expect(planIncludesFeature("NIWASTHAN_COMPLETE", "budget_export")).toBe(
      true,
    );
    expect(
      planIncludesFeature("NIWASTHAN_HOME_INTELLIGENCE", "budget_export"),
    ).toBe(true);
  });
});

describe("anyPlanIncludesFeature", () => {
  it("grants access if any one held plan includes the feature", () => {
    expect(
      anyPlanIncludesFeature(
        ["NIWASTHAN_DESIGN", "NIWASTHAN_HOME_BOOK"],
        "procurement",
      ),
    ).toBe(true);
  });

  it("denies access when no held plan includes the feature", () => {
    expect(
      anyPlanIncludesFeature(
        ["NIWASTHAN_STARTER", "NIWASTHAN_DESIGN"],
        "procurement",
      ),
    ).toBe(false);
  });

  it("denies access for an empty entitlement list", () => {
    expect(anyPlanIncludesFeature([], "ai_design_generation")).toBe(false);
  });
});
