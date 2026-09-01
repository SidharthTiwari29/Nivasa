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

  it("grants HD via an unused onboarding grant even on a free plan with unconfirmed room data", () => {
    // The trust-building override: a brand-new free-plan user with no
    // confirmed room data yet should still see one genuinely great HD
    // render, because the whole point is showing quality BEFORE either
    // condition would normally be met.
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: false,
      hasUnusedOnboardingGrant: true,
    });
    expect(tier).toBe("HD");
  });

  it("does not grant HD when hasUnusedOnboardingGrant is explicitly false", () => {
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: false,
      hasUnusedOnboardingGrant: false,
    });
    expect(tier).toBe("STANDARD");
  });

  it("defaults to STANDARD when hasUnusedOnboardingGrant is omitted entirely", () => {
    const tier = decideQualityTier({
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: false,
    });
    expect(tier).toBe("STANDARD");
  });
});
