import { describe, expect, it } from "vitest";
import { calculateBoqImpact } from "./boqImpact";

describe("calculateBoqImpact", () => {
  it("calculates the cost impact of BOQ changes", () => {
    const base = [
      {
        id: "l1",
        roomId: "r1",
        catalogueItemId: "i1",
        quantity: 2,
        unitPriceMinor: 100n,
      },
    ];
    const revised = [
      {
        id: "l1",
        roomId: "r1",
        catalogueItemId: "i1",
        quantity: 3,
        unitPriceMinor: 90n,
      },
    ];
    expect(calculateBoqImpact(base, revised)).toEqual({
      baselineMinor: 200n,
      revisedMinor: 270n,
      deltaMinor: 70n,
      changedLineIds: ["l1"],
    });
  });
});
