import { describe, expect, it } from "vitest";
import {
  calculateBoqBudgetDelta,
  toSafeSignedMinorMoney,
} from "./boqBudgetIntegration";

describe("calculateBoqBudgetDelta", () => {
  it("reports overspend as a positive delta", () => {
    expect(calculateBoqBudgetDelta(1_500_000n, 1_250_000n)).toEqual({
      lowDeltaMinor: 250_000n,
      targetDeltaMinor: 250_000n,
      highDeltaMinor: 250_000n,
    });
  });

  it("reports savings as a negative delta", () => {
    expect(calculateBoqBudgetDelta(1_100_000n, 1_250_000n).targetDeltaMinor).toBe(
      -150_000n,
    );
  });

  it("refuses unsafe conversion to the JSON-facing number contract", () => {
    expect(() => toSafeSignedMinorMoney(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow(
      "MINOR_MONEY_OUT_OF_SAFE_NUMBER_RANGE",
    );
  });
});
