import { describe, expect, it } from "vitest";
import { planBudgetReduction } from "./budgetReduction";

// Reference lines, hand-verified headroom:
// A: target 50,000, low 30,000 -> headroom 20,000
// B: target 30,000, low 25,000 -> headroom 5,000
// C: target 20,000, low 20,000 -> headroom 0 (no room to reduce)
const lineA = {
  id: "A",
  category: "Kitchen",
  description: "Modular cabinets",
  lowMinor: 30_000n,
  targetMinor: 50_000n,
};
const lineB = {
  id: "B",
  category: "Lighting",
  description: "Ceiling fixtures",
  lowMinor: 25_000n,
  targetMinor: 30_000n,
};
const lineC = {
  id: "C",
  category: "Flooring",
  description: "Tiles",
  lowMinor: 20_000n,
  targetMinor: 20_000n,
};

describe("planBudgetReduction", () => {
  it("takes from the largest-headroom line first and achieves an exact target split across two lines", () => {
    const plan = planBudgetReduction([lineA, lineB, lineC], 22_000n);

    expect(plan.targetAchieved).toBe(true);
    expect(plan.shortfallMinor).toBe(0n);
    expect(plan.suggestions).toHaveLength(2);
    expect(plan.suggestions[0]).toMatchObject({
      lineId: "A",
      reductionMinor: 20_000n,
      suggestedTargetMinor: 30_000n,
    });
    expect(plan.suggestions[1]).toMatchObject({
      lineId: "B",
      reductionMinor: 2_000n,
      suggestedTargetMinor: 28_000n,
    });
  });

  it("never suggests a target below a line's own already-estimated low", () => {
    const plan = planBudgetReduction([lineA], 100_000n);
    // Line A only has 20,000 headroom, no matter how large the ask.
    expect(plan.suggestions[0].suggestedTargetMinor).toBe(lineA.lowMinor);
    expect(plan.suggestions[0].suggestedTargetMinor).toBeGreaterThanOrEqual(
      lineA.lowMinor,
    );
  });

  it("reports an honest shortfall when the target cannot be fully achieved", () => {
    const plan = planBudgetReduction([lineA, lineB, lineC], 100_000n);

    // Total available headroom across all lines = 20,000 + 5,000 + 0 = 25,000.
    expect(plan.totalReductionMinor).toBe(25_000n);
    expect(plan.targetAchieved).toBe(false);
    expect(plan.shortfallMinor).toBe(75_000n);
  });

  it("excludes a line with zero headroom entirely from the suggestions", () => {
    const plan = planBudgetReduction([lineC], 5_000n);
    expect(plan.suggestions).toHaveLength(0);
    expect(plan.targetAchieved).toBe(false);
  });

  it("returns an achieved, empty plan for a zero or negative target reduction", () => {
    const zero = planBudgetReduction([lineA], 0n);
    expect(zero.targetAchieved).toBe(true);
    expect(zero.suggestions).toEqual([]);

    const negative = planBudgetReduction([lineA], -100n);
    expect(negative.targetAchieved).toBe(true);
  });

  it("returns an unachieved plan with the full shortfall when given no lines at all", () => {
    const plan = planBudgetReduction([], 10_000n);
    expect(plan.suggestions).toEqual([]);
    expect(plan.targetAchieved).toBe(false);
    expect(plan.shortfallMinor).toBe(10_000n);
  });
});
