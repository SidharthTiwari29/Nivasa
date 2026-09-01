import { describe, expect, it } from "vitest";
import { curateWithinBudget } from "./catalogueCuration";

// Reference scenario, hand-traced before writing assertions:
// Sofa options: Brand A 20,000 / Brand B 25,000 / Brand C 35,000
// Curtains options: Brand X 5,000 / Brand Y 8,000
// Budget: 35,000
// Baseline (cheapest per category): sofa A (20,000) + curtains X (5,000) = 25,000, headroom 10,000
// Upgrade 1: sofa A->B costs +5,000 (fits) vs curtains X->Y costs +3,000 (fits) -> picks sofa B (bigger upgrade that still fits)
// After upgrade 1: total 30,000, headroom 5,000
// Upgrade 2: sofa B->C costs +10,000 (doesn't fit in 5,000) vs curtains X->Y costs +3,000 (fits) -> picks curtains Y
// After upgrade 2: total 33,000, headroom 2,000 - no further upgrade fits, stop.
// Final: sofa Brand B (25,000), curtains Brand Y (8,000), total 33,000.
function referenceOptions() {
  return new Map([
    [
      "sofa",
      [
        {
          itemId: "sofa-a",
          name: "Sofa A",
          brand: "Brand A",
          unitPriceMinor: 20_000n,
        },
        {
          itemId: "sofa-b",
          name: "Sofa B",
          brand: "Brand B",
          unitPriceMinor: 25_000n,
        },
        {
          itemId: "sofa-c",
          name: "Sofa C",
          brand: "Brand C",
          unitPriceMinor: 35_000n,
        },
      ],
    ],
    [
      "curtains",
      [
        {
          itemId: "curtain-x",
          name: "Curtains X",
          brand: "Brand X",
          unitPriceMinor: 5_000n,
        },
        {
          itemId: "curtain-y",
          name: "Curtains Y",
          brand: "Brand Y",
          unitPriceMinor: 8_000n,
        },
      ],
    ],
  ]);
}

describe("curateWithinBudget", () => {
  it("picks the cheapest baseline option per category when budget only fits the baseline", () => {
    const result = curateWithinBudget(
      [
        { category: "sofa", quantity: 1 },
        { category: "curtains", quantity: 1 },
      ],
      referenceOptions(),
      25_000n, // exactly the baseline total, no headroom for upgrades
    );

    expect(result.totalMinor).toBe(25_000n);
    expect(result.withinBudget).toBe(true);
    expect(result.selections.find((s) => s.category === "sofa")?.itemId).toBe(
      "sofa-a",
    );
  });

  it("upgrades to the exact hand-traced selection when there is real headroom", () => {
    const result = curateWithinBudget(
      [
        { category: "sofa", quantity: 1 },
        { category: "curtains", quantity: 1 },
      ],
      referenceOptions(),
      35_000n,
    );

    expect(result.totalMinor).toBe(33_000n);
    expect(result.withinBudget).toBe(true);
    expect(result.selections.find((s) => s.category === "sofa")?.itemId).toBe(
      "sofa-b",
    );
    expect(
      result.selections.find((s) => s.category === "curtains")?.itemId,
    ).toBe("curtain-y");
  });

  it("reports an honest shortfall when even the cheapest baseline exceeds the budget", () => {
    const result = curateWithinBudget(
      [
        { category: "sofa", quantity: 1 },
        { category: "curtains", quantity: 1 },
      ],
      referenceOptions(),
      10_000n, // less than even the cheapest sofa alone
    );

    expect(result.withinBudget).toBe(false);
    expect(result.shortfallMinor).toBe(15_000n); // 25,000 baseline - 10,000 budget
  });

  it("reports a category as unfulfilled rather than fabricating an option for it", () => {
    const result = curateWithinBudget(
      [{ category: "flooring", quantity: 1 }],
      referenceOptions(), // no "flooring" entry at all
      100_000n,
    );

    expect(result.unfulfilledCategories).toEqual(["flooring"]);
    expect(result.selections).toEqual([]);
  });

  it("scales the line total correctly by quantity, using real bigint arithmetic", () => {
    const result = curateWithinBudget(
      [{ category: "curtains", quantity: 4 }],
      referenceOptions(),
      15_000n,
    );

    const selection = result.selections[0];
    expect(selection.itemId).toBe("curtain-x");
    expect(selection.lineTotalMinor).toBe(20_000n); // 5,000 x 4
  });

  it("never upgrades a category that would push the total over budget", () => {
    const result = curateWithinBudget(
      [{ category: "sofa", quantity: 1 }],
      referenceOptions(),
      24_000n, // enough for baseline (20,000) but not for the next tier (25,000)
    );

    expect(result.selections[0].itemId).toBe("sofa-a");
    expect(result.totalMinor).toBe(20_000n);
  });
});
