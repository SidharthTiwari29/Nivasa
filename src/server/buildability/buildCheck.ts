export type BuildCheckSeverity = "BLOCKER" | "WARNING" | "INFO";

export interface BuildCheckFinding {
  code: string;
  severity: BuildCheckSeverity;
  message: string;
  field?: string;
}

export interface BuildCheckInput {
  roomId: string;
  roomAreaSqFt?: number;
  items: readonly {
    itemId: string;
    quantity: number;
    unit?: string;
    widthMm?: number;
    depthMm?: number;
  }[];
}

export interface BuildCheckResult {
  roomId: string;
  buildable: boolean;
  findings: BuildCheckFinding[];
}

/** Deterministic pre-flight checks; provider/design AI must not silently override blockers. */
export function runBuildCheck(input: BuildCheckInput): BuildCheckResult {
  const findings: BuildCheckFinding[] = [];

  if (!input.roomId.trim()) {
    findings.push({
      code: "ROOM_ID_REQUIRED",
      severity: "BLOCKER",
      message: "A room is required.",
      field: "roomId",
    });
  }
  if (
    input.roomAreaSqFt !== undefined &&
    (!Number.isFinite(input.roomAreaSqFt) || input.roomAreaSqFt <= 0)
  ) {
    findings.push({
      code: "INVALID_ROOM_AREA",
      severity: "BLOCKER",
      message: "Room area must be greater than zero.",
      field: "roomAreaSqFt",
    });
  }

  for (const item of input.items) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      findings.push({
        code: "INVALID_QUANTITY",
        severity: "BLOCKER",
        message: `Item ${item.itemId} has an invalid quantity.`,
        field: `items.${item.itemId}.quantity`,
      });
    }
    if (
      item.widthMm !== undefined &&
      (!Number.isFinite(item.widthMm) || item.widthMm <= 0)
    ) {
      findings.push({
        code: "INVALID_WIDTH",
        severity: "BLOCKER",
        message: `Item ${item.itemId} has an invalid width.`,
        field: `items.${item.itemId}.widthMm`,
      });
    }
    if (
      item.depthMm !== undefined &&
      (!Number.isFinite(item.depthMm) || item.depthMm <= 0)
    ) {
      findings.push({
        code: "INVALID_DEPTH",
        severity: "BLOCKER",
        message: `Item ${item.itemId} has an invalid depth.`,
        field: `items.${item.itemId}.depthMm`,
      });
    }
  }

  return {
    roomId: input.roomId,
    buildable: !findings.some((finding) => finding.severity === "BLOCKER"),
    findings,
  };
}
