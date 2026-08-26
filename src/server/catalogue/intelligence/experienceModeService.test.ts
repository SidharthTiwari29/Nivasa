import { describe, expect, it } from "vitest";
import {
  getExperienceModeWeights,
  rankExperienceOptions,
  scoreExperienceMode,
} from "./experienceModeService";

describe("experience mode optimization", () => {
  it("uses explicit weights for every supported mode", () => {
    for (const mode of [
      "BEST_VALUE",
      "LOWEST_COST",
      "PREMIUM",
      "FASTEST",
      "LOCAL_FIRST",
    ] as const) {
      const weights = getExperienceModeWeights(mode);
      expect(
        Object.values(weights).reduce((sum, value) => sum + value, 0),
      ).toBeCloseTo(1);
    }
  });

  it("makes the lowest-cost mode price dominant", () => {
    const priceWinner = scoreExperienceMode("LOWEST_COST", {
      priceScore: 1,
      qualityScore: 0,
      confidenceScore: 0,
      availabilityScore: 0,
      localityScore: 0,
      speedScore: 0,
    });
    const qualityWinner = scoreExperienceMode("LOWEST_COST", {
      priceScore: 0,
      qualityScore: 1,
      confidenceScore: 0,
      availabilityScore: 0,
      localityScore: 0,
      speedScore: 0,
    });
    expect(priceWinner).toBeGreaterThan(qualityWinner);
  });

  it("ranks options deterministically", () => {
    const result = rankExperienceOptions("LOCAL_FIRST", [
      {
        option: "remote",
        signals: {
          priceScore: 0.9,
          qualityScore: 0.9,
          confidenceScore: 0.9,
          availabilityScore: 0.9,
          localityScore: 0.1,
          speedScore: 0.9,
        },
      },
      {
        option: "local",
        signals: {
          priceScore: 0.7,
          qualityScore: 0.7,
          confidenceScore: 0.9,
          availabilityScore: 0.9,
          localityScore: 1,
          speedScore: 0.7,
        },
      },
    ]);
    expect(result[0]?.option).toBe("local");
  });
});
