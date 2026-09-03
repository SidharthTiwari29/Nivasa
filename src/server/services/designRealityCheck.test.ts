import { describe, expect, it } from "vitest";
import { checkDesignReality } from "./designRealityCheck";

const room = { widthMm: 4000, depthMm: 3000 };

describe("checkDesignReality", () => {
  it("reports no checks for an object that genuinely fits with adequate clearance", () => {
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Sofa",
        xMm: 1000,
        yMm: 1000,
        widthMm: 1500,
        depthMm: 700,
      },
    ]);
    expect(checks).toEqual([]);
  });

  it("flags an object placed outside the room's real boundary", () => {
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Console Table",
        xMm: 3800,
        yMm: 100,
        widthMm: 500,
        depthMm: 500,
      },
    ]);
    expect(checks.some((c) => c.code === "OBJECT_OUTSIDE_ROOM")).toBe(true);
  });

  it("flags a negative coordinate as outside the room", () => {
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Chair",
        xMm: -50,
        yMm: 100,
        widthMm: 500,
        depthMm: 500,
      },
    ]);
    expect(checks.some((c) => c.code === "OBJECT_OUTSIDE_ROOM")).toBe(true);
  });

  it("flags two real objects that genuinely overlap each other", () => {
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Sofa",
        xMm: 500,
        yMm: 500,
        widthMm: 1000,
        depthMm: 800,
      },
      {
        id: "2",
        name: "Coffee Table",
        xMm: 900,
        yMm: 700,
        widthMm: 600,
        depthMm: 400,
      },
    ]);
    expect(checks.some((c) => c.code === "OBJECT_OVERLAP")).toBe(true);
  });

  it("does not flag two objects that are genuinely adjacent but not overlapping", () => {
    const checks = checkDesignReality(room, [
      { id: "1", name: "Sofa", xMm: 0, yMm: 700, widthMm: 1000, depthMm: 700 },
      { id: "2", name: "TV Unit", xMm: 0, yMm: 0, widthMm: 1000, depthMm: 700 },
    ]);
    expect(checks.some((c) => c.code === "OBJECT_OVERLAP")).toBe(false);
  });

  it("flags an object with less than the real 600mm minimum clearance from the nearest wall", () => {
    // Hand-verified: object at x=100,y=100, 2000x800 -> nearest wall
    // distance is exactly 100mm (its own x position), well under 600mm.
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Sofa",
        xMm: 100,
        yMm: 100,
        widthMm: 2000,
        depthMm: 800,
      },
    ]);
    expect(checks.some((c) => c.code === "LOW_CLEARANCE")).toBe(true);
  });

  it("does not flag an object with genuinely adequate clearance", () => {
    // Hand-verified: object at x=700,y=700, 1500x700 in a 4000x3000 room
    // -> nearest wall = min(700, 700, 4000-2200=1800, 3000-1400=1600) = 700mm, above the 600mm minimum.
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Sofa",
        xMm: 700,
        yMm: 700,
        widthMm: 1500,
        depthMm: 700,
      },
    ]);
    expect(checks.some((c) => c.code === "LOW_CLEARANCE")).toBe(false);
  });

  it("can report multiple real, distinct checks for the same object at once", () => {
    // An object both outside the room AND overlapping another - both are
    // real, independently true facts about this exact layout.
    const checks = checkDesignReality(room, [
      {
        id: "1",
        name: "Wardrobe",
        xMm: 3900,
        yMm: 100,
        widthMm: 500,
        depthMm: 500,
      },
      {
        id: "2",
        name: "Dresser",
        xMm: 3950,
        yMm: 150,
        widthMm: 400,
        depthMm: 400,
      },
    ]);
    const codes = checks.map((c) => c.code);
    expect(codes).toContain("OBJECT_OUTSIDE_ROOM");
    expect(codes).toContain("OBJECT_OVERLAP");
  });
});
