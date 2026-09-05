import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { generateHomeScene } from "./homeSceneService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    property: { findFirst: vi.fn() },
    designProject: { findMany: vi.fn(), findFirst: vi.fn() },
    roomUnderstanding: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

function confirmedUnderstanding(dimensions: {
  lengthFt: number;
  widthFt: number;
  heightFt?: number;
  doors?: Array<{
    widthFt: number;
    wall?: "NORTH" | "SOUTH" | "EAST" | "WEST";
    connectsToRoomId?: string;
  }>;
}) {
  return { dimensions } as never;
}

describe("generateHomeScene", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the property does not exist or is not owned by the caller", async () => {
    db.property.findFirst.mockResolvedValue(null);

    await expect(
      generateHomeScene("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(db.designProject.findMany).not.toHaveBeenCalled();
  });

  it("rejects when no room has both confirmed dimensions and a committed BOQ", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([]);

    await expect(
      generateHomeScene("property-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("builds a real, sequential, non-overlapping layout and camera path across two real rooms", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([
      { id: "project-living", roomId: "room-living", createdAt: new Date() },
      { id: "project-kitchen", roomId: "room-kitchen", createdAt: new Date() },
    ] as never);

    // Each generateSceneDescription call internally does its own
    // designProject.findFirst + roomUnderstanding.findFirst - mocked in
    // the same real sequence the actual code calls them in.
    db.designProject.findFirst
      .mockResolvedValueOnce({
        id: "project-living",
        room: { id: "room-living", name: "Living Room", type: "LIVING_ROOM" },
        boqs: [],
      } as never)
      .mockResolvedValueOnce({
        id: "project-kitchen",
        room: { id: "room-kitchen", name: "Kitchen", type: "KITCHEN" },
        boqs: [],
      } as never);

    db.roomUnderstanding.findFirst
      .mockResolvedValueOnce(
        confirmedUnderstanding({ lengthFt: 16.404, widthFt: 13.123 }), // 5m x 4m
      )
      .mockResolvedValueOnce(
        confirmedUnderstanding({ lengthFt: 11.483, widthFt: 9.843 }), // 3.5m x 3m
      );

    const { scene, skipped } = await generateHomeScene("property-1", "user-1");

    expect(skipped).toEqual([]);
    expect(scene.rooms).toHaveLength(2);
    // No real door connection was recorded between these two rooms, so
    // both correctly fall back to the honest auto-sequenced placement.
    expect(scene.rooms[0].positionSource).toBe("auto_sequenced");
    expect(scene.rooms[1].positionSource).toBe("auto_sequenced");

    // Hand-verified: room 1 origin (0,0), width 4m -> room 2 origin
    // starts at x=4, both share y=0 - genuinely non-overlapping.
    expect(scene.rooms[0].originM).toEqual({ x: 0, y: 0 });
    expect(scene.rooms[1].originM.x).toBeCloseTo(4.0, 1);
    expect(scene.rooms[1].originM.y).toBe(0);

    // Hand-verified camera centers: room 1 center (2, 2.5), room 2
    // center (4 + 1.5, 1.75) = (5.5, 1.75).
    expect(scene.cameraPath[0].positionM.x).toBeCloseTo(2.0, 1);
    expect(scene.cameraPath[0].positionM.y).toBeCloseTo(2.5, 1);
    expect(scene.cameraPath[1].positionM.x).toBeCloseTo(5.5, 1);
    expect(scene.cameraPath[1].positionM.y).toBeCloseTo(1.75, 1);
  });

  it("skips a room that fails its own real validation, with the real reason, without discarding a room that succeeds", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([
      { id: "project-bad", roomId: "room-bad", createdAt: new Date() },
      { id: "project-good", roomId: "room-good", createdAt: new Date() },
    ] as never);

    db.designProject.findFirst
      .mockResolvedValueOnce({
        id: "project-bad",
        room: { id: "room-bad", name: "Unmeasured Room", type: "OTHER" },
        boqs: [],
      } as never)
      .mockResolvedValueOnce({
        id: "project-good",
        room: { id: "room-good", name: "Good Room", type: "BEDROOM" },
        boqs: [],
      } as never);

    db.roomUnderstanding.findFirst
      .mockResolvedValueOnce(null) // real failure: never confirmed
      .mockResolvedValueOnce(
        confirmedUnderstanding({ lengthFt: 10, widthFt: 10 }),
      );

    const { scene, skipped } = await generateHomeScene("property-1", "user-1");

    expect(skipped).toEqual([
      {
        roomId: "room-bad",
        reason: expect.stringContaining("dimensions"),
      },
    ]);
    expect(scene.rooms).toHaveLength(1);
    expect(scene.rooms[0].name).toBe("Good Room");
  });

  it("does not process the same room twice across multiple projects tied to it", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([
      { id: "project-newer", roomId: "room-1", createdAt: new Date() },
      { id: "project-older", roomId: "room-1", createdAt: new Date() },
    ] as never);

    db.designProject.findFirst.mockResolvedValueOnce({
      id: "project-newer",
      room: { id: "room-1", name: "Living Room", type: "LIVING_ROOM" },
      boqs: [],
    } as never);
    db.roomUnderstanding.findFirst.mockResolvedValueOnce(
      confirmedUnderstanding({ lengthFt: 10, widthFt: 10 }),
    );

    const { scene } = await generateHomeScene("property-1", "user-1");

    expect(scene.rooms).toHaveLength(1);
    expect(db.designProject.findFirst).toHaveBeenCalledTimes(1);
  });

  it("places rooms using real, recorded door connections instead of the auto-sequence fallback - hand-verified three-room chain with mixed wall directions", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([
      {
        id: "project-entrance",
        roomId: "room-entrance",
        createdAt: new Date(),
      },
      { id: "project-living", roomId: "room-living", createdAt: new Date() },
      { id: "project-kitchen", roomId: "room-kitchen", createdAt: new Date() },
    ] as never);

    db.designProject.findFirst
      .mockResolvedValueOnce({
        id: "project-entrance",
        room: { id: "room-entrance", name: "Entrance", type: "OTHER" },
        boqs: [],
      } as never)
      .mockResolvedValueOnce({
        id: "project-living",
        room: { id: "room-living", name: "Living Room", type: "LIVING_ROOM" },
        boqs: [],
      } as never)
      .mockResolvedValueOnce({
        id: "project-kitchen",
        room: { id: "room-kitchen", name: "Kitchen", type: "KITCHEN" },
        boqs: [],
      } as never);

    // Real door connections: Entrance's NORTH door leads to Living
    // Room; Living Room's EAST door leads to Kitchen - matching the
    // exact scenario hand-verified in Python before this was written.
    db.roomUnderstanding.findFirst
      .mockResolvedValueOnce(
        confirmedUnderstanding({
          lengthFt: 8.2021,
          widthFt: 6.5617,
          doors: [
            {
              widthFt: 3,
              wall: "NORTH",
              connectsToRoomId: "room-living",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        confirmedUnderstanding({
          lengthFt: 19.685,
          widthFt: 16.4042,
          doors: [
            { widthFt: 3, wall: "EAST", connectsToRoomId: "room-kitchen" },
          ],
        }),
      )
      .mockResolvedValueOnce(
        confirmedUnderstanding({ lengthFt: 11.4829, widthFt: 9.8425 }),
      );

    const { scene } = await generateHomeScene("property-1", "user-1");

    const byName = Object.fromEntries(scene.rooms.map((r) => [r.name, r]));

    expect(byName["Entrance"].originM).toEqual({ x: 0, y: 0 });
    expect(byName["Entrance"].positionSource).toBe("auto_sequenced"); // the root has no incoming door to verify against

    expect(byName["Living Room"].originM.x).toBeCloseTo(0, 1);
    expect(byName["Living Room"].originM.y).toBeCloseTo(2.5, 1);
    expect(byName["Living Room"].positionSource).toBe("real_adjacency");

    expect(byName["Kitchen"].originM.x).toBeCloseTo(5.0, 1);
    expect(byName["Kitchen"].originM.y).toBeCloseTo(2.5, 1);
    expect(byName["Kitchen"].positionSource).toBe("real_adjacency");
  });

  it("falls back honestly for a room whose door connection points at a room outside this scene", async () => {
    db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
    db.designProject.findMany.mockResolvedValue([
      { id: "project-a", roomId: "room-a", createdAt: new Date() },
    ] as never);

    db.designProject.findFirst.mockResolvedValueOnce({
      id: "project-a",
      room: { id: "room-a", name: "Room A", type: "OTHER" },
      boqs: [],
    } as never);

    db.roomUnderstanding.findFirst.mockResolvedValueOnce(
      confirmedUnderstanding({
        lengthFt: 10,
        widthFt: 10,
        doors: [
          {
            widthFt: 3,
            wall: "NORTH",
            connectsToRoomId: "room-not-in-this-scene",
          },
        ],
      }),
    );

    const { scene } = await generateHomeScene("property-1", "user-1");

    expect(scene.rooms).toHaveLength(1);
    expect(scene.rooms[0].positionSource).toBe("auto_sequenced");
  });
});
