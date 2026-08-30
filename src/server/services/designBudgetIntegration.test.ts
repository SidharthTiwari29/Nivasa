import { describe, expect, it } from "vitest";
import {
  calculateDesignBudgetImpact,
  sumKnownBudgetImpact,
} from "./designBudgetIntegration";

describe("designBudgetIntegration", () => {
  it("calculates known design impacts", () => {
    const impacts = calculateDesignBudgetImpact([
      {
        selectionId: "sel-1",
        catalogueItemId: "cat-1",
        description: "Sofa",
        quantity: 2,
        unitPriceMinor: 125000,
        currency: "inr",
      },
    ]);

    expect(impacts).toEqual([
      {
        selectionId: "sel-1",
        description: "Sofa",
        quantity: 2,
        unitPriceMinor: 125000,
        impactMinor: 250000,
        currency: "INR",
        priceKnown: true,
      },
    ]);
  });

  it("preserves unknown pricing without asserting budget impact", () => {
    const impacts = calculateDesignBudgetImpact([
      {
        selectionId: "sel-2",
        description: "Custom artwork",
        quantity: 1,
        currency: "INR",
      },
    ]);

    expect(impacts[0].priceKnown).toBe(false);
    expect(impacts[0].impactMinor).toBeUndefined();
  });

  it("sums only known impacts in the requested currency", () => {
    const impacts = calculateDesignBudgetImpact([
      { selectionId: "1", description: "A", quantity: 1, unitPriceMinor: 1000, currency: "INR" },
      { selectionId: "2", description: "B", quantity: 3, unitPriceMinor: 2000, currency: "INR" },
      { selectionId: "3", description: "C", quantity: 1, unitPriceMinor: 9000, currency: "USD" },
      { selectionId: "4", description: "D", quantity: 1, currency: "INR" },
    ]);

    expect(sumKnownBudgetImpact(impacts, "inr")).toBe(7000);
  });

  it("rejects invalid quantities and prices", () => {
    expect(() => calculateDesignBudgetImpact([
      { selectionId: "1", description: "A", quantity: 0, currency: "INR" },
    ])).toThrow("quantity must be greater than zero");

    expect(() => calculateDesignBudgetImpact([
      { selectionId: "2", description: "B", quantity: 1, unitPriceMinor: 1.5, currency: "INR" },
    ])).toThrow("unitPriceMinor must be a non-negative integer");
  });
});
