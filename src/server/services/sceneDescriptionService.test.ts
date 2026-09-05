import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { generateSceneDescription } from "./sceneDescriptionService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    designProject: { findFirst: vi.fn() },
    roomUnderstanding: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

const baseProject = {
  id: "project-1",
  room: { id: "room-1", name: "Master Bedroom", type: "BEDROOM" },
  boqs: [],
};

describe("generateSceneDescription", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the project does not exist or is not owned by the caller", async () => {
    db.designProject.findFirst.mockResolvedValue(null);

    await expect(
      generateSceneDescription("project-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a project not tied to a specific room", async () => {
    db.designProject.findFirst.mockResolvedValue({
      ...baseProject,
      room: null,
    } as never);

    await expect(
      generateSceneDescription("project-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects when the room's dimensions were never confirmed", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue(null);

    await expect(
      generateSceneDescription("project-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects when confirmed dimensions are missing a real length or width", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: { heightFt: 9 },
    } as never);

    await expect(
      generateSceneDescription("project-1", "user-1"),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("converts real feet dimensions to meters correctly (hand-verified: 12ft x 15ft x 9ft)", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: { lengthFt: 12, widthFt: 15, heightFt: 9 },
    } as never);

    const scene = await generateSceneDescription("project-1", "user-1");

    // Hand-verified: 12 * 0.3048 = 3.6576 -> 3.658, 15 * 0.3048 = 4.572,
    // 9 * 0.3048 = 2.7432 -> 2.743
    expect(scene.room.lengthM).toBe(3.658);
    expect(scene.room.widthM).toBe(4.572);
    expect(scene.room.heightM).toBe(2.743);
  });

  it("centers a door on its real wall using that wall's true length (hand-verified: 3ft door on a 15ft-wide south wall)", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: {
        lengthFt: 12,
        widthFt: 15,
        doors: [{ widthFt: 3, wall: "SOUTH" }],
      },
    } as never);

    const scene = await generateSceneDescription("project-1", "user-1");
    const door = scene.room.openings.find((o) => o.type === "door");

    // Hand-verified: south wall length = widthM = 4.572, door width =
    // 3 * 0.3048 = 0.9144 -> 0.914, offset = (4.572 - 0.914) / 2 = 1.829
    expect(door?.widthM).toBe(0.914);
    expect(door?.offsetM).toBe(1.829);
  });

  it("applies a real, common default ceiling height only when genuinely not recorded", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: { lengthFt: 12, widthFt: 15 },
    } as never);

    const scene = await generateSceneDescription("project-1", "user-1");

    expect(scene.room.heightM).toBe(2.7);
  });

  it("places real BOQ furniture items around the room's real perimeter, never fabricating a designed layout", async () => {
    db.designProject.findFirst.mockResolvedValue({
      ...baseProject,
      boqs: [
        {
          lines: [
            {
              id: "line-1",
              description: "Queen Bed",
              catalogueItem: { brand: "Godrej Interio", category: "bed" },
            },
            {
              id: "line-2",
              description: "Wardrobe",
              catalogueItem: { brand: "Godrej Interio", category: "wardrobe" },
            },
          ],
        },
      ],
    } as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: { lengthFt: 12, widthFt: 15 },
    } as never);

    const scene = await generateSceneDescription("project-1", "user-1");

    expect(scene.furniture).toHaveLength(2);
    expect(scene.furniture[0].label).toBe("Queen Bed");
    expect(scene.furniture[0].boqLineId).toBe("line-1");
    // Real, distinct positions - never both items stacked at the same
    // point, which would silently defeat the whole point of placement.
    expect(scene.furniture[0].positionM).not.toEqual(
      scene.furniture[1].positionM,
    );
  });

  it("returns an empty furniture list honestly when no committed BOQ exists yet, rather than fabricating placeholder items", async () => {
    db.designProject.findFirst.mockResolvedValue(baseProject as never);
    db.roomUnderstanding.findFirst.mockResolvedValue({
      dimensions: { lengthFt: 12, widthFt: 15 },
    } as never);

    const scene = await generateSceneDescription("project-1", "user-1");

    expect(scene.furniture).toEqual([]);
  });
});
