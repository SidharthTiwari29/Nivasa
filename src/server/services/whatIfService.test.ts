import { describe, expect, it } from "vitest";
import { whatIfService } from "@/server/services/whatIfService";

describe("whatIfService", () => {
  it("calculates a deterministic saving and ranks alternatives", () => {
    const result = whatIfService.preview({
      baseVersion: 2,
      currentPriceMinor: 200000,
      proposedPriceMinor: 175000,
      roomId: null,
      scopeChange: "REPLACE",
      reason: "Use an equivalent lower-cost finish",
      designImpact: "SIMILAR",
      functionImpact: "SIMILAR",
      inputs: { source: "user" },
      candidates: [
        {
          id: "candidate-a",
          name: "Equivalent finish",
          priceMinor: 175000,
          qualityImpact: "SIMILAR",
          maintenanceImpact: "SIMILAR",
          durabilityImpact: "SIMILAR",
          appearanceImpact: "SIMILAR",
          explanation: "Same intended function with a lower observed price.",
          evidenceIds: ["evidence-1"],
        },
      ],
    });

    expect(result.savingMinor).toBe(25000n);
    expect(result.priceDeltaMinor).toBe(-25000n);
    expect(result.decision).toBe("SAVE");
    expect(result.rankedCandidates[0]?.savingMinor).toBe(25000n);
  });

  it("does not invent savings when a price is unknown", () => {
    const result = whatIfService.preview({
      baseVersion: 1,
      currentPriceMinor: null,
      proposedPriceMinor: null,
      roomId: null,
      scopeChange: "MODIFY",
      reason: "Price not established",
      designImpact: "UNKNOWN",
      functionImpact: "UNKNOWN",
      inputs: {},
      candidates: [],
    });

    expect(result.savingMinor).toBeNull();
    expect(result.priceDeltaMinor).toBeNull();
    expect(result.decision).toBe("UNKNOWN");
    expect(result.confidenceBps).toBe(5000);
  });
});
