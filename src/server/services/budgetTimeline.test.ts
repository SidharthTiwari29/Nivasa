import { describe, expect, it } from "vitest";
import { buildBudgetTimeline } from "./budgetTimeline";

describe("buildBudgetTimeline", () => {
  it("interleaves versions and impacts in true chronological order, not grouped by type", () => {
    const versions = [
      {
        version: 1,
        totalLowMinor: 90_000n,
        totalTargetMinor: 100_000n,
        totalHighMinor: 110_000n,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
      {
        version: 2,
        totalLowMinor: 108_000n,
        totalTargetMinor: 120_000n,
        totalHighMinor: 132_000n,
        createdAt: new Date("2026-01-03T00:00:00Z"),
      },
    ];
    const impacts = [
      {
        baseVersion: 1,
        proposedTargetDeltaMinor: 20_000n,
        reason: "Upgraded kitchen laminate grade",
        createdAt: new Date("2026-01-02T00:00:00Z"),
      },
    ];

    const timeline = buildBudgetTimeline(versions, impacts);

    // Chronological: v1 (Jan 1) -> impact (Jan 2) -> v2 (Jan 3).
    expect(timeline.map((e) => e.type)).toEqual([
      "VERSION_CREATED",
      "IMPACT_RECORDED",
      "VERSION_CREATED",
    ]);
    expect(timeline[1].reason).toBe("Upgraded kitchen laminate grade");
    expect(timeline[1].targetDeltaMinor).toBe(20_000n);
  });

  it("returns an empty timeline when there is no history at all", () => {
    expect(buildBudgetTimeline([], [])).toEqual([]);
  });

  it("handles versions with no recorded impacts (a version created with no explained change)", () => {
    const versions = [
      {
        version: 1,
        totalLowMinor: 90_000n,
        totalTargetMinor: 100_000n,
        totalHighMinor: 110_000n,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ];

    const timeline = buildBudgetTimeline(versions, []);

    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("VERSION_CREATED");
  });

  it("handles impacts with no corresponding version yet (proposed but not yet applied)", () => {
    const impacts = [
      {
        baseVersion: 1,
        proposedTargetDeltaMinor: -15_000n,
        reason: "Considering a cheaper wardrobe hardware option",
        createdAt: new Date("2026-01-05T00:00:00Z"),
      },
    ];

    const timeline = buildBudgetTimeline([], impacts);

    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("IMPACT_RECORDED");
    expect(timeline[0].targetDeltaMinor).toBe(-15_000n);
  });

  it("preserves a negative delta correctly (a cost-saving change, not just increases)", () => {
    const impacts = [
      {
        baseVersion: 1,
        proposedTargetDeltaMinor: -12_000n,
        reason: "Switched to local carpentry for wardrobe",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ];

    const timeline = buildBudgetTimeline([], impacts);

    expect(timeline[0].targetDeltaMinor).toBe(-12_000n);
  });
});
