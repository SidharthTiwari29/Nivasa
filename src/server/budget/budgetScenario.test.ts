import { describe, expect, it } from "vitest";
import { calculateRevisionImpact } from "./budgetScenario";

describe("calculateRevisionImpact", () => {
  it("reports the exact cost impact of a design revision", () => {
    const result = calculateRevisionImpact(
      {
        id: "v1",
        name: "Target",
        locked: true,
        lines: [{ id: "kitchen", roomId: "r1", amountMinor: 100n }],
      },
      {
        id: "v2",
        name: "Revision",
        locked: false,
        lines: [{ id: "kitchen", roomId: "r1", amountMinor: 80n }],
      },
    );
    expect(result).toEqual({
      baselineMinor: 100n,
      revisedMinor: 80n,
      deltaMinor: -20n,
      changedLineIds: ["kitchen"],
    });
  });

  it("requires a locked baseline and editable revision", () => {
    expect(() =>
      calculateRevisionImpact(
        { id: "v1", name: "Target", locked: false, lines: [] },
        { id: "v2", name: "Revision", locked: false, lines: [] },
      ),
    ).toThrow("baseline budget must be locked");
  });
});
