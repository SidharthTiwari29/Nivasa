import { describe, expect, it } from "vitest";
import { calculateCost } from "./costing";

describe("calculateCost", () => {
  it("calculates deterministic material, labour, wastage, tax and discount totals", () => {
    expect(
      calculateCost([
        {
          quantity: 2n,
          unitPriceMinor: 10000n,
          labourMinor: 500n,
          wastageBps: 500n,
          taxRateBps: 1800n,
          discountMinor: 100n,
        },
      ]),
    ).toEqual({
      subtotalMinor: 20500n,
      wastageMinor: 1025n,
      taxMinor: 3857n,
      discountMinor: 100n,
      totalMinor: 25282n,
    });
  });
  it("rejects negative quantities", () => {
    expect(() =>
      calculateCost([{ quantity: -1n, unitPriceMinor: 100n }]),
    ).toThrow("INVALID_COST_LINE");
  });
});
