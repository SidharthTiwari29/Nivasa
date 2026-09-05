import { describe, expect, it } from "vitest";
import { validateFloorPlanObservations } from "./floorPlanGeometryValidationService";

describe("validateFloorPlanObservations", () => {
  it("raises no issues for a genuinely valid, complete observation and preserves its real confidence", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Master Bedroom",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 12,
          widthFt: 10,
          heightFt: 9,
          doors: [{ widthFt: 3, wall: "SOUTH" }],
          windows: [{ widthFt: 4, wall: "NORTH" }],
        },
      },
    ]);

    expect(result.issues).toEqual([]);
    expect(result.effectiveConfidenceBpsById["obs-1"]).toBe(9000);
  });

  it("flags and heavily penalizes missing dimensions, hand-verified degraded confidence", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Kitchen",
        confidenceBps: 10000,
        dimensions: { lengthFt: 10, heightFt: 9 }, // widthFt missing, no doors/windows
      },
    ]);

    expect(result.issues.some((i) => i.code === "MISSING_DIMENSIONS")).toBe(
      true,
    );
    // Hand-verified: 5000 (missing dimension) + 1000 (zero openings) = 6000 penalty
    expect(result.effectiveConfidenceBpsById["obs-1"]).toBe(4000);
  });

  it("flags a non-positive dimension as an impossible dimension, never silently accepted", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Bathroom",
        confidenceBps: 8000,
        dimensions: { lengthFt: -5, widthFt: 6 },
      },
    ]);

    expect(
      result.issues.some(
        (i) => i.code === "IMPOSSIBLE_DIMENSION" && i.observationId === "obs-1",
      ),
    ).toBe(true);
  });

  it("flags a dimension far outside any realistic range", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Living Room",
        confidenceBps: 8000,
        dimensions: { lengthFt: 5000, widthFt: 10 },
      },
    ]);

    expect(result.issues.some((i) => i.code === "IMPOSSIBLE_DIMENSION")).toBe(
      true,
    );
  });

  it("flags a real area-vs-dimensions mismatch beyond the honest tolerance, hand-verified ratio", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Study",
        confidenceBps: 9000,
        dimensions: { lengthFt: 12, widthFt: 10, areaSqFt: 200 },
      },
    ]);

    // Hand-verified: computed area 120, stated 200, ratio 0.667 > 0.15 tolerance
    expect(result.issues.some((i) => i.code === "AREA_MISMATCH")).toBe(true);
  });

  it("does not flag an area within the honest rounding tolerance", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Study",
        confidenceBps: 9000,
        dimensions: { lengthFt: 12, widthFt: 10, areaSqFt: 125 }, // 4% off 120
      },
    ]);

    expect(result.issues.some((i) => i.code === "AREA_MISMATCH")).toBe(false);
  });

  it("flags a door wider than the real wall it's reported to be on, hand-verified wall-length math", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Kids Room",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 12,
          widthFt: 10,
          // SOUTH wall runs along widthFt (10ft) - a 12ft door cannot fit
          doors: [{ widthFt: 12, wall: "SOUTH" }],
        },
      },
    ]);

    expect(result.issues.some((i) => i.code === "DOOR_WIDER_THAN_WALL")).toBe(
      true,
    );
  });

  it("does not flag a door that genuinely fits its wall", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Kids Room",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 12,
          widthFt: 10,
          doors: [{ widthFt: 3, wall: "SOUTH" }],
        },
      },
    ]);

    expect(result.issues.some((i) => i.code === "DOOR_WIDER_THAN_WALL")).toBe(
      false,
    );
  });

  it("flags a real unit that was never normalized to feet", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Balcony",
        confidenceBps: 8000,
        dimensions: { lengthFt: 4, widthFt: 2, unit: "meters" },
      },
    ]);

    expect(result.issues.some((i) => i.code === "UNIT_NOT_NORMALIZED")).toBe(
      true,
    );
  });

  it("flags duplicate room labels within the same analysis as contradictory evidence", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Bedroom",
        confidenceBps: 9000,
        dimensions: { lengthFt: 10, widthFt: 10 },
      },
      {
        id: "obs-2",
        roomLabel: "Bedroom",
        confidenceBps: 8500,
        dimensions: { lengthFt: 11, widthFt: 9 },
      },
    ]);

    expect(
      result.issues.filter((i) => i.code === "DUPLICATE_ROOM_LABEL"),
    ).toHaveLength(2);
  });

  it("flags a door connecting to a room that was never detected in this analysis", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Living Room",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 15,
          widthFt: 12,
          doors: [
            { widthFt: 3, wall: "EAST", connectsToRoomId: "nonexistent" },
          ],
        },
      },
    ]);

    expect(
      result.issues.some((i) => i.code === "DANGLING_DOOR_CONNECTION"),
    ).toBe(true);
  });

  it("flags a real, one-sided door connection that the other room does not reciprocate", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Living Room",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 15,
          widthFt: 12,
          doors: [{ widthFt: 3, wall: "EAST", connectsToRoomId: "obs-2" }],
        },
      },
      {
        id: "obs-2",
        roomLabel: "Kitchen",
        confidenceBps: 9000,
        dimensions: { lengthFt: 10, widthFt: 8, doors: [] },
      },
    ]);

    expect(
      result.issues.some(
        (i) =>
          i.code === "UNRECIPROCATED_DOOR_CONNECTION" &&
          i.observationId === "obs-1",
      ),
    ).toBe(true);
  });

  it("does not flag a real, genuinely reciprocated door connection", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Living Room",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 15,
          widthFt: 12,
          doors: [{ widthFt: 3, wall: "EAST", connectsToRoomId: "obs-2" }],
        },
      },
      {
        id: "obs-2",
        roomLabel: "Kitchen",
        confidenceBps: 9000,
        dimensions: {
          lengthFt: 10,
          widthFt: 8,
          doors: [{ widthFt: 3, wall: "WEST", connectsToRoomId: "obs-1" }],
        },
      },
    ]);

    expect(
      result.issues.some((i) => i.code === "UNRECIPROCATED_DOOR_CONNECTION"),
    ).toBe(false);
  });

  it("treats a completely missing dimensions object as a real error, never silently skipped", () => {
    const result = validateFloorPlanObservations([
      {
        id: "obs-1",
        roomLabel: "Mystery Room",
        confidenceBps: 9000,
        dimensions: null,
      },
    ]);

    expect(result.issues.some((i) => i.code === "MISSING_DIMENSIONS")).toBe(
      true,
    );
    expect(result.effectiveConfidenceBpsById["obs-1"]).toBe(0);
  });
});
