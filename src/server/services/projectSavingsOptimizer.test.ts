import { describe, expect, it } from "vitest";
import { optimizeProjectSavings } from "./projectSavingsOptimizer";

describe("optimizeProjectSavings", () => {
  it("ranks evidenced savings opportunities first", () => {
    const result = optimizeProjectSavings([
      {
        id: "a",
        description: "Sofa alternative",
        currentPriceMinor: 100000,
        alternativePriceMinor: 80000,
        qualityImpact: "SIMILAR",
        maintenanceImpact: "SIMILAR",
        evidenceQuality: "HIGH",
      },
      {
        id: "b",
        description: "Chair alternative",
        currentPriceMinor: 50000,
        alternativePriceMinor: 40000,
        qualityImpact: "BETTER",
        maintenanceImpact: "BETTER",
        evidenceQuality: "MEDIUM",
      },
    ]);

    expect(result[0].decision).toBe("SAVE");
    expect(result[0].savingMinor).toBe(20000);
    expect(result[0].confidenceBps).toBeGreaterThan(result[1].confidenceBps);
  });

  it("does not invent savings when either price is unknown", () => {
    const result = optimizeProjectSavings([
      {
        id: "unknown",
        description: "Custom item",
        currentPriceMinor: 100000,
        alternativePriceMinor: null,
        qualityImpact: "UNKNOWN",
        maintenanceImpact: "UNKNOWN",
        evidenceQuality: "UNKNOWN",
      },
    ]);

    expect(result[0].decision).toBe("UNKNOWN");
    expect(result[0].savingMinor).toBeNull();
  });

  it("identifies neutral and cost outcomes", () => {
    const result = optimizeProjectSavings([
      {
        id: "neutral",
        description: "Same price",
        currentPriceMinor: 100,
        alternativePriceMinor: 100,
        qualityImpact: "SIMILAR",
        maintenanceImpact: "SIMILAR",
        evidenceQuality: "HIGH",
      },
      {
        id: "cost",
        description: "Upgrade",
        currentPriceMinor: 100,
        alternativePriceMinor: 125,
        qualityImpact: "BETTER",
        maintenanceImpact: "BETTER",
        evidenceQuality: "HIGH",
      },
    ]);

    expect(result.find(({ id }) => id === "neutral")?.decision).toBe("NEUTRAL");
    expect(result.find(({ id }) => id === "cost")?.decision).toBe("COST");
  });
});
