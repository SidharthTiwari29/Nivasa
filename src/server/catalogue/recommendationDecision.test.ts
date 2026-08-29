import { describe, expect, it } from "vitest";
import { chooseRecommendation } from "./recommendationDecision";

describe("chooseRecommendation", () => {
  const candidates = [
    {
      id: "a",
      priceMinor: 100n,
      score: 8,
      deliveryDays: 7,
      local: false,
      evidenceBacked: true,
    },
    {
      id: "b",
      priceMinor: 80n,
      score: 7,
      deliveryDays: 3,
      local: true,
      evidenceBacked: true,
    },
    {
      id: "c",
      priceMinor: 10n,
      score: 10,
      deliveryDays: 1,
      local: true,
      evidenceBacked: false,
    },
  ];

  it("selects lowest cost only from evidence-backed candidates", () =>
    expect(chooseRecommendation("LOWEST_COST", candidates).candidateId).toBe(
      "b",
    ));
  it("selects fastest candidate", () =>
    expect(chooseRecommendation("FASTEST", candidates).candidateId).toBe("b"));
  it("rejects an empty eligible set", () =>
    expect(() =>
      chooseRecommendation("BEST_VALUE", [{ ...candidates[2] }]),
    ).toThrow("no evidence-backed"));
});
