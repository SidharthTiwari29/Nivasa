import { describe, expect, it } from "vitest";
import {
  assertExperienceWeights,
  getExperienceWeights,
} from "./experienceModes";

describe("Nivasa experience modes", () => {
  it("provides deterministic, explainable weights for every mode", () => {
    for (const mode of [
      "BEST_VALUE",
      "LOWEST_COST",
      "PREMIUM",
      "FASTEST",
      "LOCAL_FIRST",
    ] as const) {
      const weights = getExperienceWeights(mode);
      expect(() => assertExperienceWeights(weights)).not.toThrow();
    }
  });

  it("does not allow weights that change the optimization contract", () => {
    expect(() =>
      assertExperienceWeights({
        priceBps: 3_000,
        confidenceBps: 2_000,
        availabilityBps: 2_000,
        localBps: 1_000,
        qualityBps: 2_001,
      }),
    ).toThrow("experience weights must total 10000 basis points");
  });
});
