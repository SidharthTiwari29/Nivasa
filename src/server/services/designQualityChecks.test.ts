import { describe, expect, it } from "vitest";
import {
  checkBudgetRealism,
  checkDoorClearance,
  checkRoomAreaAdequacy,
  checkRoomUnderstandingConfidence,
} from "./designQualityChecks";

describe("checkRoomAreaAdequacy", () => {
  it("flags a bedroom below the minimum functional area", () => {
    const flags = checkRoomAreaAdequacy("room-1", "BEDROOM", 60);
    expect(flags).toHaveLength(1);
    expect(flags[0].code).toBe("ROOM_AREA_BELOW_MINIMUM");
    expect(flags[0].severity).toBe("RISK");
  });

  it("does not flag a bedroom at or above the minimum area", () => {
    expect(checkRoomAreaAdequacy("room-1", "BEDROOM", 100)).toEqual([]);
  });

  it("flags unknown area as informational, not a risk", () => {
    const flags = checkRoomAreaAdequacy("room-1", "BEDROOM", null);
    expect(flags[0].severity).toBe("INFO");
  });

  it("does not flag room types with no defined minimum", () => {
    expect(checkRoomAreaAdequacy("room-1", "OTHER", 5)).toEqual([]);
  });
});

describe("checkRoomUnderstandingConfidence", () => {
  it("flags an unconfirmed room understanding", () => {
    const flags = checkRoomUnderstandingConfidence(
      "room-1",
      "UNCONFIRMED",
      9000,
    );
    expect(flags.some((f) => f.code === "ROOM_UNDERSTANDING_UNCONFIRMED")).toBe(
      true,
    );
  });

  it("flags low confidence even if confirmed", () => {
    const flags = checkRoomUnderstandingConfidence("room-1", "CONFIRMED", 5000);
    expect(
      flags.some((f) => f.code === "ROOM_UNDERSTANDING_LOW_CONFIDENCE"),
    ).toBe(true);
  });

  it("raises no flags for a confirmed, high-confidence room", () => {
    expect(
      checkRoomUnderstandingConfidence("room-1", "CONFIRMED", 9500),
    ).toEqual([]);
  });

  it("does not flag confidence when it is null", () => {
    const flags = checkRoomUnderstandingConfidence("room-1", "CONFIRMED", null);
    expect(flags).toEqual([]);
  });
});

describe("checkBudgetRealism", () => {
  it("flags an implausibly low per-sqft budget", () => {
    // ₹100/sqft = 10,000 paise/sqft, well below the ₹500/sqft (50,000
    // paise) floor threshold. Total for 1000 sqft = 10,000,000 minor units.
    const flags = checkBudgetRealism(10_000_000n, 1000);
    expect(flags[0]?.code).toBe("BUDGET_IMPLAUSIBLY_LOW");
  });

  it("flags an implausibly high per-sqft budget", () => {
    // ₹1,00,000/sqft = 10,000,000 paise/sqft, well above the ₹50,000/sqft
    // (5,000,000 paise) ceiling. Total for 1000 sqft = 10,000,000,000n.
    const flags = checkBudgetRealism(10_000_000_000n, 1000);
    expect(flags[0]?.code).toBe("BUDGET_IMPLAUSIBLY_HIGH");
  });

  it("raises no flags for a realistic per-sqft budget", () => {
    // ₹1,500/sqft = 150,000 paise/sqft, comfortably between both
    // thresholds. Total for 1000 sqft = 150,000,000 minor units.
    expect(checkBudgetRealism(150_000_000n, 1000)).toEqual([]);
  });

  it("does not divide by zero for an unknown area", () => {
    expect(checkBudgetRealism(1_000_000n, 0)).toEqual([]);
  });
});

describe("checkDoorClearance", () => {
  it("flags a door narrower than the standard width", () => {
    const flags = checkDoorClearance("room-1", {
      doors: [{ widthFt: 2.0 }],
    });
    expect(flags).toHaveLength(1);
    expect(flags[0].code).toBe("DOOR_WIDTH_BELOW_STANDARD");
  });

  it("does not flag a door at or above the standard width", () => {
    expect(checkDoorClearance("room-1", { doors: [{ widthFt: 3.0 }] })).toEqual(
      [],
    );
  });

  it("returns no flags when there is no dimension data at all", () => {
    expect(checkDoorClearance("room-1", null)).toEqual([]);
  });

  it("returns no flags when dimensions exist but no doors were recorded", () => {
    expect(checkDoorClearance("room-1", { lengthFt: 10 })).toEqual([]);
  });

  it("counts multiple narrow doors correctly in the message", () => {
    const flags = checkDoorClearance("room-1", {
      doors: [{ widthFt: 2.0 }, { widthFt: 2.2 }, { widthFt: 3.0 }],
    });
    expect(flags[0].message).toContain("2 door(s)");
  });
});
