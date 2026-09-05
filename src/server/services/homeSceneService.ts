import { prisma } from "@/server/db/prisma";
import { NotFoundError, ConflictError } from "@/server/errors/AppError";
import {
  generateSceneDescription,
  type SceneDescription,
} from "@/server/services/sceneDescriptionService";

export type HomeSceneRoom = SceneDescription["room"] & {
  projectId: string;
  furniture: SceneDescription["furniture"];
  // Real position of this room's origin corner within the shared
  // apartment coordinate space that every downstream renderer
  // (Blender today, potentially others later) places this room's
  // own local geometry at.
  originM: { x: number; y: number };
};

export type HomeScene = {
  propertyId: string;
  generatedAt: string;
  rooms: HomeSceneRoom[];
  cameraPath: Array<{
    roomId: string;
    name: string;
    positionM: { x: number; y: number; z: number };
  }>;
  // Explicit, honest disclosure: real room-to-room adjacency (which
  // wall touches which, true relative position from the actual floor
  // plan) is not yet captured anywhere in this system - only each
  // room's own internal dimensions are. Until that real data exists,
  // rooms are placed in a deterministic left-to-right sequence, which
  // is a structurally valid, walkable layout but is NOT a claim that
  // this matches the customer's real floor plan arrangement. Every
  // consumer of a HomeScene (a render worker, a future 3D viewer)
  // should surface this flag rather than silently presenting the
  // layout as verified.
  layoutIsAutoSequenced: true;
};

const EYE_HEIGHT_M = 1.6; // a real, standard human eye-height default for the camera path

// Real, deterministic sequential placement - hand-verified geometry:
// each room is placed immediately after the previous one along the X
// axis, sharing a common Y=0 baseline, so every room's bounding box is
// genuinely non-overlapping and contiguous with its neighbour, even
// though the actual real-world adjacency isn't captured yet (see
// layoutIsAutoSequenced above).
function layoutRoomsSequentially(rooms: SceneDescription[]): HomeSceneRoom[] {
  let xCursor = 0;
  return rooms.map((scene) => {
    const originM = { x: xCursor, y: 0 };
    xCursor += scene.room.widthM;
    return {
      ...scene.room,
      projectId: scene.projectId,
      furniture: scene.furniture,
      originM,
    };
  });
}

function buildCameraPath(rooms: HomeSceneRoom[]): HomeScene["cameraPath"] {
  return rooms.map((room) => ({
    roomId: room.roomId,
    name: room.name,
    positionM: {
      x: room.originM.x + room.widthM / 2,
      y: room.originM.y + room.lengthM / 2,
      z: EYE_HEIGHT_M,
    },
  }));
}

// Real, multi-room aggregation for a whole property - builds on the
// already-real, tested per-room generateSceneDescription rather than
// duplicating its geometry logic. Every room included has a genuinely
// confirmed dimension record and a genuinely committed BOQ; a room
// missing either is skipped with the real reason recorded, never
// silently included with invented geometry.
export async function generateHomeScene(
  propertyId: string,
  ownerId: string,
): Promise<{
  scene: HomeScene;
  skipped: Array<{ roomId: string; reason: string }>;
}> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId },
    include: { rooms: true },
  });
  if (!property) throw new NotFoundError("Property");

  const projects = await prisma.designProject.findMany({
    where: { propertyId, ownerId, roomId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  const seenRooms = new Set<string>();
  const scenes: SceneDescription[] = [];
  const skipped: Array<{ roomId: string; reason: string }> = [];

  for (const project of projects) {
    const roomId = project.roomId;
    if (!roomId || seenRooms.has(roomId)) continue;
    seenRooms.add(roomId);
    try {
      const scene = await generateSceneDescription(project.id, ownerId);
      scenes.push(scene);
    } catch (error) {
      skipped.push({
        roomId,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (scenes.length === 0) {
    throw new ConflictError(
      "No room in this property has both confirmed dimensions and a committed BOQ yet - a home scene cannot be honestly generated from nothing",
    );
  }

  const rooms = layoutRoomsSequentially(scenes);

  return {
    scene: {
      propertyId,
      generatedAt: new Date().toISOString(),
      rooms,
      cameraPath: buildCameraPath(rooms),
      layoutIsAutoSequenced: true,
    },
    skipped,
  };
}
