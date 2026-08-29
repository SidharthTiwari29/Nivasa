export type DesignRealitySeverity = "INFO" | "WARNING" | "BLOCKING";

export type DesignRealityIssue = {
  code:
  | "INSUFFICIENT_CIRCULATION"
  | "DOOR_CLEARANCE_CONFLICT"
  | "WINDOW_CONFLICT"
  | "FIXTURE_CLEARANCE_CONFLICT";
  severity: DesignRealitySeverity;
  elementId: string;
  message: string;
  evidence: "VERIFIED" | "ESTIMATED";
  measuredMinor?: bigint;
  requiredMinor?: bigint;
};

export type Rect = {
  id: string;
  xMinor: bigint;
  yMinor: bigint;
  widthMinor: bigint;
  heightMinor: bigint;
  kind: "FURNITURE" | "DOOR" | "WINDOW" | "FIXTURE" | "WALL";
};

export type CirculationRequirement = {
  elementId: string;
  clearanceMinor: bigint;
  measuredClearanceMinor: bigint;
  evidence: "VERIFIED" | "ESTIMATED";
};

const overlaps = (a: Rect, b: Rect): boolean =>
  a.xMinor < b.xMinor + b.widthMinor &&
  a.xMinor + a.widthMinor > b.xMinor &&
  a.yMinor < b.yMinor + b.heightMinor &&
  a.yMinor + a.heightMinor > b.yMinor;

export const runDesignRealityCheck = (
  elements: readonly Rect[],
  circulation: readonly CirculationRequirement[] = [],
): DesignRealityIssue[] => {
  const issues: DesignRealityIssue[] = [];

  for (const requirement of circulation) {
    if (requirement.measuredClearanceMinor < requirement.clearanceMinor) {
      issues.push({
        code: "INSUFFICIENT_CIRCULATION",
        severity: "BLOCKING",
        elementId: requirement.elementId,
        message: `Measured circulation ${requirement.measuredClearanceMinor} is below required ${requirement.clearanceMinor}.`,
        evidence: requirement.evidence,
        measuredMinor: requirement.measuredClearanceMinor,
        requiredMinor: requirement.clearanceMinor,
      });
    }
  }

  for (const element of elements) {
    if (element.kind !== "FURNITURE" && element.kind !== "FIXTURE") continue;
    for (const boundary of elements) {
      if (boundary.id === element.id) continue;
      if (boundary.kind === "DOOR" && overlaps(element, boundary)) {
        issues.push({
          code: "DOOR_CLEARANCE_CONFLICT",
          severity: "BLOCKING",
          elementId: element.id,
          message: `Element ${element.id} overlaps door ${boundary.id}.`,
          evidence: "VERIFIED",
        });
      }
      if (boundary.kind === "WINDOW" && overlaps(element, boundary)) {
        issues.push({
          code: "WINDOW_CONFLICT",
          severity: "WARNING",
          elementId: element.id,
          message: `Element ${element.id} overlaps window ${boundary.id}.`,
          evidence: "VERIFIED",
        });
      }
    }
  }

  return issues;
};
