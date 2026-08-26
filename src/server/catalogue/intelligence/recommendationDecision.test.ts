import { describe, expect, it } from "vitest";
import { explainRecommendation, rankWithExplanation } from "./recommendationDecision";
import type { MarketObservation } from "./source-domain";

const makeObservation = (id: string, amountMinor: bigint, geography = "Bengaluru"): MarketObservation => ({
  observationId: id,
  canonicalProductId: "cp-1",
  source: { sourceId: `s-${id}`, kind: "RETAILER", name: `Retailer ${id}` },
  evidence: {
    evidenceId: `e-${id}`,
    source: { sourceId: `s-${id}`, kind: "RETAILER", name: `Retailer ${id}` },
    observedAt: new Date("2026-08-26T00:00:00.000Z"),
  },
  amountMinor,
  currency: "INR",
  available: true,
  geography,
  confidenceBps: 9_500,
  truth: "VERIFIED",
});

describe("recommendationDecision", () => {
  it("returns an auditable explanation tied to evidence", () => {
    const decision = explainRecommendation(makeObservation("a", 80_000n), "BEST_VALUE", 100_000n, "Bengaluru");
    expect(decision.reasons).toEqual(["available", "lower observed price", "high-confidence evidence", "local source"]);
    expect(decision.evidence.evidenceId).toBe("e-a");
    expect(decision.mode).toBe("BEST_VALUE");
  });

  it("keeps ranking deterministic", () => {
    const result = rankWithExplanation(
      [makeObservation("b", 90_000n), makeObservation("a", 90_000n)],
      "LOWEST_COST",
      100_000n,
    );
    expect(result.map((item) => item.observationId)).toEqual(["a", "b"]);
  });
});
