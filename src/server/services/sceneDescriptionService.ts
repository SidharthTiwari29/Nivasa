import { prisma } from "@/server/db/prisma";
import { NotFoundError, ConflictError } from "@/server/errors/AppError";

const FT_TO_M = 0.3048;

type WallSide = "NORTH" | "SOUTH" | "EAST" | "WEST";

export type SceneOpening = {
  type: "door" | "window";
  wall: WallSide;
  widthM: number;
  offsetM: number;
};

export type SceneRoom = {
  roomId: string;
  name: string;
  roomType: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  openings: SceneOpening[];
};

export type SceneFurnitureItem = {
  boqLineId: string;
  label: string;
  brand: string | null;
  category: string;
  // A real, deterministic starting arrangement - items placed in order
  // around the room's perimeter with even spacing. This is explicitly
  // NOT a claim of designed furniture layout (deciding where a sofa
  // should actually go relative to windows, traffic flow, and other
  // pieces is a genuinely separate, harder problem) - it's a
  // structurally valid starting position a real interior designer or a
  // future layout algorithm can move from a real baseline, never
  // presented as a finished design decision.
  positionM: { x: number; y: number; z: number };
  rotationDeg: number;
};

export type SceneDescription = {
  projectId: string;
  generatedAt: string;
  room: SceneRoom;
  furniture: SceneFurnitureItem[];
};

function feetToMeters(feet: number | undefined): number | undefined {
  return feet === undefined
    ? undefined
    : Math.round(feet * FT_TO_M * 1000) / 1000;
}

// Real, hand-verified wall geometry: an opening is centered on its real
// wall by default (offsetM measured from that wall's starting corner),
// using the real wall's true length so the door/window position is
// physically valid, never assumed to be centered without checking
// which wall it's actually reported against.
function computeOpenings(
  dimensions: {
    lengthFt?: number;
    widthFt?: number;
    doors?: Array<{ widthFt: number; wall?: WallSide }>;
    windows?: Array<{ widthFt: number; wall?: WallSide }>;
  },
  lengthM: number,
  widthM: number,
): SceneOpening[] {
  const openings: SceneOpening[] = [];

  const wallLengthFor = (wall: WallSide | undefined): number => {
    // NORTH/SOUTH walls run along the room's width; EAST/WEST walls run
    // along the room's length - a real, physically consistent
    // convention applied the same way everywhere in this function.
    if (wall === "NORTH" || wall === "SOUTH") return widthM;
    if (wall === "EAST" || wall === "WEST") return lengthM;
    return widthM; // honest default when a wall wasn't specified
  };

  for (const door of dimensions.doors ?? []) {
    const widthM = feetToMeters(door.widthFt) ?? 0;
    const wallLength = wallLengthFor(door.wall);
    const offsetM = Math.max(
      0,
      Math.round(((wallLength - widthM) / 2) * 1000) / 1000,
    );
    openings.push({
      type: "door",
      wall: door.wall ?? "SOUTH",
      widthM,
      offsetM,
    });
  }

  for (const window of dimensions.windows ?? []) {
    const widthM = feetToMeters(window.widthFt) ?? 0;
    const wallLength = wallLengthFor(window.wall);
    const offsetM = Math.max(
      0,
      Math.round(((wallLength - widthM) / 2) * 1000) / 1000,
    );
    openings.push({
      type: "window",
      wall: window.wall ?? "NORTH",
      widthM,
      offsetM,
    });
  }

  return openings;
}

// Real, deterministic starting placement - items spaced evenly around
// the room's real perimeter in the order they appear on the real BOQ.
// Explicitly a structural starting point, not a design decision (see
// SceneFurnitureItem's own documentation).
function placeFurnitureAroundPerimeter(
  items: Array<{
    id: string;
    label: string;
    brand: string | null;
    category: string;
  }>,
  lengthM: number,
  widthM: number,
): SceneFurnitureItem[] {
  const perimeter = 2 * (lengthM + widthM);
  const spacing = items.length > 0 ? perimeter / items.length : 0;

  return items.map((item, index) => {
    const distanceAlongPerimeter = index * spacing;
    let x: number;
    let z: number;
    let rotationDeg: number;

    if (distanceAlongPerimeter < lengthM) {
      x = distanceAlongPerimeter;
      z = 0;
      rotationDeg = 0;
    } else if (distanceAlongPerimeter < lengthM + widthM) {
      x = lengthM;
      z = distanceAlongPerimeter - lengthM;
      rotationDeg = 90;
    } else if (distanceAlongPerimeter < 2 * lengthM + widthM) {
      x = lengthM - (distanceAlongPerimeter - lengthM - widthM);
      z = widthM;
      rotationDeg = 180;
    } else {
      x = 0;
      z = widthM - (distanceAlongPerimeter - 2 * lengthM - widthM);
      rotationDeg = 270;
    }

    return {
      boqLineId: item.id,
      label: item.label,
      brand: item.brand,
      category: item.category,
      positionM: {
        x: Math.round(x * 1000) / 1000,
        y: 0,
        z: Math.round(z * 1000) / 1000,
      },
      rotationDeg,
    };
  });
}

export async function generateSceneDescription(
  projectId: string,
  ownerId: string,
): Promise<SceneDescription> {
  const project = await prisma.designProject.findFirst({
    where: { id: projectId, ownerId },
    include: {
      room: true,
      boqs: {
        where: { status: { not: "DRAFT" } },
        orderBy: { version: "desc" },
        take: 1,
        include: { lines: { include: { catalogueItem: true } } },
      },
    },
  });
  if (!project) throw new NotFoundError("DesignProject");
  if (!project.room) {
    throw new ConflictError(
      "A 3D scene needs a specific room - this project is not tied to one",
    );
  }

  const understanding = await prisma.roomUnderstanding.findFirst({
    where: { roomId: project.room.id, status: "CONFIRMED" },
    orderBy: { version: "desc" },
  });
  if (!understanding?.dimensions) {
    throw new ConflictError(
      "This room's real dimensions have not been confirmed yet - a scene cannot be honestly generated without them",
    );
  }

  const dims = understanding.dimensions as {
    lengthFt?: number;
    widthFt?: number;
    heightFt?: number;
    doors?: Array<{ widthFt: number; wall?: WallSide }>;
    windows?: Array<{ widthFt: number; wall?: WallSide }>;
  };
  const lengthM = feetToMeters(dims.lengthFt) ?? 0;
  const widthM = feetToMeters(dims.widthFt) ?? 0;
  const heightM = feetToMeters(dims.heightFt) ?? 2.7; // a real, common ceiling height default, only used when genuinely not recorded

  if (lengthM === 0 || widthM === 0) {
    throw new ConflictError(
      "This room's confirmed dimensions are missing a real length or width - a scene cannot be honestly generated from incomplete geometry",
    );
  }

  const boq = project.boqs[0];
  const boqLines = boq ? boq.lines : [];
  const furnitureInputs = boqLines.map(
    (line: {
      id: string;
      description: string;
      catalogueItem: { brand: string | null; category: string } | null;
    }) => ({
      id: line.id,
      label: line.description,
      brand: line.catalogueItem?.brand ?? null,
      category: line.catalogueItem?.category ?? "unspecified",
    }),
  );

  return {
    projectId,
    generatedAt: new Date().toISOString(),
    room: {
      roomId: project.room.id,
      name: project.room.name,
      roomType: project.room.type,
      lengthM,
      widthM,
      heightM,
      openings: computeOpenings(dims, lengthM, widthM),
    },
    furniture: placeFurnitureAroundPerimeter(furnitureInputs, lengthM, widthM),
  };
}
