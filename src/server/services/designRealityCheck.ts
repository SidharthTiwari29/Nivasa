export type DesignCheck = {
  code: string;
  severity: "warning" | "error";
  message: string;
};

export type DesignGeometry = {
  widthMm: number;
  depthMm: number;
};

export type DesignObject = {
  id: string;
  name: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  depthMm: number;
};

const MIN_CLEARANCE_MM = 600;

export const checkDesignReality = (
  room: DesignGeometry,
  objects: DesignObject[],
): DesignCheck[] => {
  const checks: DesignCheck[] = [];

  for (const object of objects) {
    const right = object.xMm + object.widthMm;
    const bottom = object.yMm + object.depthMm;

    if (
      object.xMm < 0 ||
      object.yMm < 0 ||
      right > room.widthMm ||
      bottom > room.depthMm
    ) {
      checks.push({
        code: "OBJECT_OUTSIDE_ROOM",
        severity: "error",
        message: `${object.name} does not fit within the room boundary.`,
      });
    }
  }

  for (let index = 0; index < objects.length; index += 1) {
    for (
      let otherIndex = index + 1;
      otherIndex < objects.length;
      otherIndex += 1
    ) {
      const first = objects[index];
      const second = objects[otherIndex];
      const overlaps =
        first.xMm < second.xMm + second.widthMm &&
        first.xMm + first.widthMm > second.xMm &&
        first.yMm < second.yMm + second.depthMm &&
        first.yMm + first.depthMm > second.yMm;

      if (overlaps) {
        checks.push({
          code: "OBJECT_OVERLAP",
          severity: "error",
          message: `${first.name} overlaps ${second.name}.`,
        });
      }
    }
  }

  for (const object of objects) {
    const nearestWall = Math.min(
      object.xMm,
      object.yMm,
      room.widthMm - (object.xMm + object.widthMm),
      room.depthMm - (object.yMm + object.depthMm),
    );

    if (nearestWall >= 0 && nearestWall < MIN_CLEARANCE_MM) {
      checks.push({
        code: "LOW_CLEARANCE",
        severity: "warning",
        message: `${object.name} has less than ${MIN_CLEARANCE_MM} mm of clearance.`,
      });
    }
  }

  return checks;
};
