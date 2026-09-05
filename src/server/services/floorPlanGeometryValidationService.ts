type Wall = "NORTH" | "SOUTH" | "EAST" | "WEST";

export type ObservationDimensions = {
  lengthFt?: number;
  widthFt?: number;
  heightFt?: number;
  areaSqFt?: number;
  unit?: string;
  doors?: Array<{ widthFt?: number; wall?: Wall; connectsToRoomId?: string }>;
  windows?: Array<{ widthFt?: number; wall?: Wall }>;
};

export type ValidationObservation = {
  id: string;
  roomLabel: string;
  confidenceBps: number | null;
  dimensions: ObservationDimensions | null;
};

export type ValidationIssue = {
  observationId: string | null; // null when the issue spans multiple observations
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type ValidationResult = {
  issues: ValidationIssue[];
  // A real, computed confidence that can only ever be equal to or
  // lower than the AI's own reported confidence - degraded when
  // evidence is genuinely incomplete (missing height, no openings
  // detected at all). Never raised above what the provider itself
  // reported; this function's job is to catch problems, not to
  // manufacture false reassurance.
  effectiveConfidenceBpsById: Record<string, number | null>;
};

// Same real, physically consistent convention already used in
// sceneDescriptionService.computeOpenings: NORTH/SOUTH walls run along
// the room's width; EAST/WEST walls run along its length.
function wallLengthFor(
  wall: Wall | undefined,
  lengthFt: number | undefined,
  widthFt: number | undefined,
): number | undefined {
  if (wall === "NORTH" || wall === "SOUTH") return widthFt;
  if (wall === "EAST" || wall === "WEST") return lengthFt;
  return widthFt;
}

const MAX_REASONABLE_FT = 500;
const MAX_REASONABLE_HEIGHT_FT = 50;
const AREA_TOLERANCE_RATIO = 0.15; // a real, generous 15% tolerance for rounding in a hand-read plan

// Real, honest scope: this validates what the current observation
// schema actually contains - rectangular length/width/height, doors,
// and windows. It deliberately does NOT attempt "room overlap" or
// "wall continuity" checks, since those need real 2D positions and a
// full wall graph that do not exist at this stage (positions are only
// computed later, during confirmed spatial-truth layout in
// homeSceneService) - claiming to check them here would be exactly
// the kind of fabricated certainty this system exists to avoid.
export function validateFloorPlanObservations(
  observations: ValidationObservation[],
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const effectiveConfidenceBpsById: Record<string, number | null> = {};

  const labelCounts = new Map<string, number>();
  for (const obs of observations) {
    labelCounts.set(obs.roomLabel, (labelCounts.get(obs.roomLabel) ?? 0) + 1);
  }

  for (const obs of observations) {
    const dims = obs.dimensions;
    let confidencePenaltyBps = 0;

    // Duplicate / contradictory room labels within the same analysis.
    if ((labelCounts.get(obs.roomLabel) ?? 0) > 1) {
      issues.push({
        observationId: obs.id,
        severity: "warning",
        code: "DUPLICATE_ROOM_LABEL",
        message: `More than one detected room is labeled "${obs.roomLabel}" - please confirm these are genuinely different rooms.`,
      });
    }

    if (!dims) {
      issues.push({
        observationId: obs.id,
        severity: "error",
        code: "MISSING_DIMENSIONS",
        message: `"${obs.roomLabel}" has no detected dimensions at all.`,
      });
      effectiveConfidenceBpsById[obs.id] = 0;
      continue;
    }

    // Impossible dimensions.
    for (const [field, value, max] of [
      ["lengthFt", dims.lengthFt, MAX_REASONABLE_FT],
      ["widthFt", dims.widthFt, MAX_REASONABLE_FT],
      ["heightFt", dims.heightFt, MAX_REASONABLE_HEIGHT_FT],
    ] as const) {
      if (value === undefined) continue;
      if (value <= 0) {
        issues.push({
          observationId: obs.id,
          severity: "error",
          code: "IMPOSSIBLE_DIMENSION",
          message: `"${obs.roomLabel}" has a non-positive ${field} (${value}).`,
        });
        confidencePenaltyBps += 10000; // an impossible dimension invalidates the whole observation
      } else if (value > max) {
        issues.push({
          observationId: obs.id,
          severity: "error",
          code: "IMPOSSIBLE_DIMENSION",
          message: `"${obs.roomLabel}"'s ${field} (${value}ft) is far outside a realistic range.`,
        });
        confidencePenaltyBps += 10000;
      }
    }

    if (dims.lengthFt === undefined || dims.widthFt === undefined) {
      issues.push({
        observationId: obs.id,
        severity: "error",
        code: "MISSING_DIMENSIONS",
        message: `"${obs.roomLabel}" is missing a real length or width.`,
      });
      confidencePenaltyBps += 5000;
    }

    if (dims.heightFt === undefined) {
      confidencePenaltyBps += 500; // real but minor - height is genuinely less critical than floor dimensions
    }

    // Area vs length x width consistency.
    if (
      dims.areaSqFt !== undefined &&
      dims.lengthFt !== undefined &&
      dims.widthFt !== undefined
    ) {
      const computedArea = dims.lengthFt * dims.widthFt;
      const ratio =
        computedArea === 0
          ? Infinity
          : Math.abs(computedArea - dims.areaSqFt) / computedArea;
      if (ratio > AREA_TOLERANCE_RATIO) {
        issues.push({
          observationId: obs.id,
          severity: "warning",
          code: "AREA_MISMATCH",
          message: `"${obs.roomLabel}"'s stated area (${dims.areaSqFt} sq ft) does not roughly match length × width (${computedArea.toFixed(1)} sq ft).`,
        });
        confidencePenaltyBps += 1500;
      }
    }

    // Unit normalization - a defensive check for any future provider
    // that reports a unit other than feet, since every dimension field
    // in this schema is named and assumed to already be in feet.
    if (dims.unit && !/^(ft|feet)$/i.test(dims.unit)) {
      issues.push({
        observationId: obs.id,
        severity: "error",
        code: "UNIT_NOT_NORMALIZED",
        message: `"${obs.roomLabel}" was reported in "${dims.unit}", not feet - this must be converted before it can be trusted.`,
      });
      confidencePenaltyBps += 10000;
    }

    // Door-wall intersection: a door cannot be wider than the real
    // wall it's reported to be on.
    for (const door of dims.doors ?? []) {
      const wallLength = wallLengthFor(door.wall, dims.lengthFt, dims.widthFt);
      if (
        door.widthFt !== undefined &&
        wallLength !== undefined &&
        door.widthFt > wallLength
      ) {
        issues.push({
          observationId: obs.id,
          severity: "error",
          code: "DOOR_WIDER_THAN_WALL",
          message: `"${obs.roomLabel}" has a ${door.widthFt}ft door on a wall only ${wallLength}ft long.`,
        });
        confidencePenaltyBps += 3000;
      }
    }

    // Real evidence-completeness signal: zero openings detected at all
    // is unusual for a genuine room and a real reason to trust the
    // observation a little less, not an error on its own.
    if ((dims.doors?.length ?? 0) === 0 && (dims.windows?.length ?? 0) === 0) {
      confidencePenaltyBps += 1000;
    }

    const raw = obs.confidenceBps ?? 10000;
    effectiveConfidenceBpsById[obs.id] = Math.max(
      0,
      raw - confidencePenaltyBps,
    );
  }

  // Door-to-room connectivity: a door's connectsToRoomId should point
  // to another observation's real matchedRoomId, and the connection
  // should genuinely be reciprocated - a real, contradictory-evidence
  // check, not merely a dangling-reference check.
  const byId = new Map(observations.map((o) => [o.id, o]));
  for (const obs of observations) {
    for (const door of obs.dimensions?.doors ?? []) {
      if (!door.connectsToRoomId) continue;
      const target = byId.get(door.connectsToRoomId);
      if (!target) {
        issues.push({
          observationId: obs.id,
          severity: "warning",
          code: "DANGLING_DOOR_CONNECTION",
          message: `"${obs.roomLabel}" has a door connecting to a room that wasn't detected in this analysis.`,
        });
        continue;
      }
      const reciprocated = (target.dimensions?.doors ?? []).some(
        (d) => d.connectsToRoomId === obs.id,
      );
      if (!reciprocated) {
        issues.push({
          observationId: obs.id,
          severity: "warning",
          code: "UNRECIPROCATED_DOOR_CONNECTION",
          message: `"${obs.roomLabel}" reports a door to "${target.roomLabel}", but "${target.roomLabel}" does not report one back - please confirm this connection is real.`,
        });
      }
    }
  }

  return { issues, effectiveConfidenceBpsById };
}
