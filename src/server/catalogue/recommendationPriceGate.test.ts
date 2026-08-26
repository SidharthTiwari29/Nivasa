import { describe, expect, it } from "vitest";
import { validateRecommendationPrice } from "./recommendationPriceGate";

describe("validateRecommendationPrice", () => {
  it("accepts an evidence-backed observed price", () => {
    expect(validateRecommendationPrice({ catalogueItemId: "i1", amountMinor: 100n, evidenceId: "e1", observedAt: new Date("2026-08-25") }, new Date("2026-08-26"))).toEqual({ accepted: true });
  });

  it("rejects recommendations without price evidence", () => {
    expect(validateRecommendationPrice({ catalogueItemId: "i1", amountMinor: 100n })).toEqual({ accepted: false, reason: "PRICE_EVIDENCE_REQUIRED" });
  });
});
