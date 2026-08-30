import { describe, expect, it } from "vitest";
import { recommendDesignCandidates } from "./recommendationEngine";

describe("recommendDesignCandidates", () => {
  it("ranks candidates by explicit design constraints and evidence", () => {
    const result = recommendDesignCandidates([
      {
        catalogueItemId: "2",
        name: "Basic Sofa",
        category: "Seating",
        room: "Living Room",
        styleTags: ["modern"],
        priceMinor: 80000,
        evidenceQuality: "MEDIUM",
      },
      {
        catalogueItemId: "1",
        name: "Modern Sofa",
        category: "Seating",
        room: "Living Room",
        styleTags: ["Modern", "Minimal"],
        priceMinor: 90000,
        evidenceQuality: "HIGH",
      },
    ], {
      room: "living room",
      requiredCategory: "seating",
      preferredStyles: ["minimal"],
      maxPriceMinor: 100000,
    });

    expect(result[0].catalogueItemId).toBe("1");
    expect(result[0].reasons).toEqual(expect.arrayContaining([
      "matches required category",
      "matches room",
      "matches preferred style: Minimal",
      "within budget constraint",
    ]));
  });

  it("does not claim budget fit when price is unknown", () => {
    const result = recommendDesignCandidates([{
      catalogueItemId: "1",
      name: "Unpriced Chair",
      category: "Seating",
      evidenceQuality: "HIGH",
    }], { maxPriceMinor: 100000 });

    expect(result[0].reasons).toContain("price is unknown; budget fit is not asserted");
    expect(result[0].reasons).not.toContain("within budget constraint");
  });

  it("uses deterministic name ordering for equal scores", () => {
    const result = recommendDesignCandidates([
      { catalogueItemId: "2", name: "Zeta", category: "Lighting", evidenceQuality: "UNKNOWN" },
      { catalogueItemId: "1", name: "Alpha", category: "Lighting", evidenceQuality: "UNKNOWN" },
    ], {});

    expect(result.map(({ name }) => name)).toEqual(["Alpha", "Zeta"]);
  });
});
