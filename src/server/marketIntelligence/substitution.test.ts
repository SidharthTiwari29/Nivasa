import { describe, expect, it } from "vitest";
import { rankSubstitutions } from "./substitution";

describe("rankSubstitutions", () => {
  it("computes deterministic savings and preserves curated trade-offs", () => {
    const ranked = rankSubstitutions(15000n, [
      {
        id: "alt-1",
        name: "Equivalent laminate",
        priceMinor: 12000n,
        qualityImpact: "SIMILAR",
        maintenanceImpact: "SIMILAR",
        durabilityImpact: "SIMILAR",
        appearanceImpact: "DIFFERENT",
        explanation: "Same application with a different finish.",
        evidenceIds: ["e1", "e2"],
      },
    ]);

    expect(ranked[0]).toMatchObject({
      id: "alt-1",
      decision: "SAVE",
      confidenceBps: 7000,
    });
    expect(ranked[0]?.savingMinor).toBe(3000n);
  });

  it("does not manufacture a price delta when the current price is unknown", () => {
    const ranked = rankSubstitutions(null, [
      {
        id: "alt-1",
        name: "Unknown-price alternative",
        priceMinor: 12000n,
        qualityImpact: "UNKNOWN",
        maintenanceImpact: "UNKNOWN",
        durabilityImpact: "UNKNOWN",
        appearanceImpact: "UNKNOWN",
        explanation: "Requires current quotation.",
        evidenceIds: [],
      },
    ]);

    expect(ranked[0]?.decision).toBe("UNKNOWN");
    expect(ranked[0]?.savingMinor).toBeNull();
  });
});
