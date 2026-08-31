import { describe, expect, it } from "vitest";
import { decideQualityTier } from "./qualityTier";

describe("decideQualityTier", () => {
  it("uses the free-tier-eligible STANDARD quality by default", () => {
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: false,
    });
    expect(tier).toBe("STANDARD");
  });

  it("uses STANDARD even on a paying plan if room confidence isn't confirmed/high", () => {
    // Paying for the expensive model on data that might be wrong would be
    // spending money on a result likely to need redoing.
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: true,
    });
    expect(tier).toBe("STANDARD");
  });

  it("uses STANDARD even for a high-confidence room if the plan doesn't include priority visualization", () => {
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: true,
      planIncludesPriorityVisualization: false,
    });
    expect(tier).toBe("STANDARD");
  });

  it("only uses the paid HD tier when BOTH conditions are met", () => {
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: true,
      planIncludesPriorityVisualization: true,
    });
    expect(tier).toBe("HD");
  });
});
