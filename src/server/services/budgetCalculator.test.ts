import { describe, expect, it } from "vitest";
import { calculateBudgetTotals } from "./budgetCalculator";

describe("calculateBudgetTotals", () => {
  it("sums exact INR minor-unit budget bands without floating point", () => {
    expect(
      calculateBudgetTotals(
        [
          { lowMinor: 100000n, targetMinor: 150000n, highMinor: 200000n },
          { lowMinor: 50000n, targetMinor: 75000n, highMinor: 100000n },
        ],
        25000n,
      ),
    ).toEqual({
      lowMinor: 175000n,
      targetMinor: 250000n,
      highMinor: 325000n,
    });
  });

  it("rejects an inverted range", () => {
    expect(() =>
      calculateBudgetTotals([
        { lowMinor: 200n, targetMinor: 100n, highMinor: 300n },
      ]),
    ).toThrow("INVALID_BUDGET_RANGE");
  });

  it("rejects negative contingency", () => {
    expect(() => calculateBudgetTotals([], -1n)).toThrow("INVALID_CONTINGENCY");
  });
});
