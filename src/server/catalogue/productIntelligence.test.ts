import { describe, expect, it } from "vitest";
import {
  matchesProductConstraint,
  normaliseProductCandidate,
  rankProductCandidates,
} from "./productIntelligence";

const base = {
  catalogueItemId: "1",
  name: "  Tile A  ",
  category: "Tiles",
  unit: " SQFT ",
  priceMinor: 1200,
  currency: "inr",
  available: true,
  evidenceQuality: "HIGH" as const,
};

describe("productIntelligence", () => {
  it("normalises catalogue identity fields without changing price", () => {
    expect(normaliseProductCandidate(base)).toMatchObject({
      name: "Tile A",
      category: "tiles",
      unit: "sqft",
      currency: "INR",
      priceMinor: 1200,
    });
  });

  it("matches category, unit, price and availability constraints", () => {
    expect(matchesProductConstraint(base, {
      category: "tiles",
      unit: "sqft",
      maxPriceMinor: 1200,
      requireAvailable: true,
    })).toBe(true);
    expect(matchesProductConstraint(base, { maxPriceMinor: 1199 })).toBe(false);
    expect(matchesProductConstraint({ ...base, available: false }, { requireAvailable: true })).toBe(false);
  });

  it("ranks stronger evidence before weaker evidence, then lower known price", () => {
    const result = rankProductCandidates([
      { ...base, catalogueItemId: "low", priceMinor: 900, evidenceQuality: "LOW" },
      { ...base, catalogueItemId: "high-expensive", priceMinor: 1500, evidenceQuality: "HIGH" },
      { ...base, catalogueItemId: "high-cheap", priceMinor: 1000, evidenceQuality: "HIGH" },
    ]);
    expect(result.map((item) => item.catalogueItemId)).toEqual([
      "high-cheap",
      "high-expensive",
      "low",
    ]);
  });

  it("does not treat an unknown price as cheaper than a known price", () => {
    const result = rankProductCandidates([
      { ...base, catalogueItemId: "unknown", priceMinor: undefined },
      { ...base, catalogueItemId: "known", priceMinor: 1000 },
    ]);
    expect(result.map((item) => item.catalogueItemId)).toEqual(["known", "unknown"]);
  });
});
