import { describe, expect, it } from "vitest";
import { compareDesigns } from "./designBattle";

// README's own example figures: Design A ₹6.8L, Design B ₹7.2L.
// 6.8 lakh = 680,000 rupees = 68,000,000 paise.
// 7.2 lakh = 720,000 rupees = 72,000,000 paise.
const designA = {
  projectId: "project-a",
  projectName: "Design A",
  boq: { totalMinor: 68_000_000n, currency: "INR" },
};
const designB = {
  projectId: "project-b",
  projectName: "Design B",
  boq: { totalMinor: 72_000_000n, currency: "INR" },
};

describe("compareDesigns", () => {
  it("returns the real, computed cost for both designs when both have a BOQ", () => {
    const result = compareDesigns(designA, designB);

    expect(result.a.cost).toEqual({
      available: true,
      value: { totalMinor: 68_000_000n, currency: "INR" },
    });
    expect(result.b.cost).toEqual({
      available: true,
      value: { totalMinor: 72_000_000n, currency: "INR" },
    });
  });

  it("marks cost unavailable with a clear reason when a design has no BOQ yet", () => {
    const noBoqDesign = {
      projectId: "project-c",
      projectName: "Design C",
      boq: null,
    };

    const result = compareDesigns(noBoqDesign, designB);

    expect(result.a.cost.available).toBe(false);
    if (!result.a.cost.available) {
      expect(result.a.cost.reason).toContain("No BOQ");
    }
  });

  it("never fabricates storage, durability, maintenance, or style-match scores - all four are explicitly unavailable", () => {
    const result = compareDesigns(designA, designB);

    for (const side of [result.a, result.b]) {
      expect(side.storage.available).toBe(false);
      expect(side.durability.available).toBe(false);
      expect(side.maintenance.available).toBe(false);
      expect(side.styleMatch.available).toBe(false);
    }
  });

  it("never fabricates a star-rating recommendation without the holistic data it requires", () => {
    const result = compareDesigns(designA, designB);

    expect(result.recommendation.available).toBe(false);
    if (!result.recommendation.available) {
      expect(result.recommendation.reason.length).toBeGreaterThan(0);
    }
  });

  it("preserves each design's real project id and name in the result", () => {
    const result = compareDesigns(designA, designB);

    expect(result.a.projectId).toBe("project-a");
    expect(result.a.projectName).toBe("Design A");
    expect(result.b.projectId).toBe("project-b");
    expect(result.b.projectName).toBe("Design B");
  });
});
