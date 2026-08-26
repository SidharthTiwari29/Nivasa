import { describe, expect, it } from "vitest";
import { calculateBudgetScenario } from "./whatIfService";

describe("calculateBudgetScenario", () => {
  it("calculates total savings and changed lines", () => {
    const result = calculateBudgetScenario(
      { name: "Target", lines: [{ id: "kitchen", amountMinor: 100_000n }, { id: "wardrobe", amountMinor: 50_000n }] },
      { name: "Value", lines: [{ id: "kitchen", amountMinor: 80_000n }, { id: "wardrobe", amountMinor: 50_000n }] },
    );
    expect(result.baselineMinor).toBe(150_000n);
    expect(result.scenarioMinor).toBe(130_000n);
    expect(result.savingsMinor).toBe(20_000n);
    expect(result.changedLineIds).toEqual(["kitchen"]);
  });

  it("never reports negative savings when scenario costs more", () => {
    const result = calculateBudgetScenario(
      { name: "Target", lines: [{ id: "x", amountMinor: 100n }] },
      { name: "Premium", lines: [{ id: "x", amountMinor: 150n }] },
    );
    expect(result.savingsMinor).toBe(0n);
    expect(result.savingsBps).toBe(0);
  });
});
