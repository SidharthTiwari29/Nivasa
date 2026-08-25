import { describe, expect, it } from "vitest";
import { rankValueCandidates } from "./valueEngine";

describe("rankValueCandidates", () => {
  it("prefers a strong evidenced value option over a cheap but weak option", () => {
    const ranked = rankValueCandidates([
      {
        id: "cheap",
        priceMinor: 200000,
        qualityScoreBps: 4500,
        compatibilityScoreBps: 9000,
        durabilityScoreBps: 4000,
        designFitScoreBps: 8000,
        evidenceConfidenceBps: 9000,
        tradeOffs: ["Lower durability"],
      },
      {
        id: "value",
        priceMinor: 350000,
        qualityScoreBps: 8500,
        compatibilityScoreBps: 9000,
        durabilityScoreBps: 8500,
        designFitScoreBps: 8500,
        evidenceConfidenceBps: 9500,
        normalPriceMinor: 450000,
        tradeOffs: [],
      },
    ], 400000);

    expect(ranked[0]?.id).toBe("value");
    expect(ranked[0]?.dealScoreBps).toBeGreaterThan(0);
  });

  it("does not call an unsupported discount a deal", () => {
    const ranked = rankValueCandidates([
      {
        id: "claimed-discount",
        priceMinor: 300000,
        qualityScoreBps: 8000,
        compatibilityScoreBps: 8000,
        durabilityScoreBps: 8000,
        designFitScoreBps: 8000,
        evidenceConfidenceBps: 4000,
        previousPriceMinor: 500000,
        tradeOffs: [],
      },
    ]);

    expect(ranked[0]?.tier).not.toBe("DEAL");
  });
});
