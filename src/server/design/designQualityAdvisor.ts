export type DesignQualitySeverity = "INFO" | "WARNING" | "BLOCKING";

export type DesignQualityFinding = {
  code:
    | "EMPTY_ROOM"
    | "ROOM_OVERFILLED"
    | "NO_PRIMARY_FUNCTION"
    | "LOW_FUNCTIONAL_COVERAGE";
  severity: DesignQualitySeverity;
  roomId: string;
  message: string;
  scoreImpact: number;
};

export type DesignQualityRoom = {
  id: string;
  areaMinor: bigint;
  primaryFunction?: string;
  functionalElementIds: readonly string[];
  placedElementCount: number;
};

export type DesignQualityAdvice = {
  score: number;
  findings: DesignQualityFinding[];
  summary: string;
};

export const adviseDesignQuality = (
  rooms: readonly DesignQualityRoom[],
): DesignQualityAdvice => {
  const findings: DesignQualityFinding[] = [];

  for (const room of rooms) {
    if (!room.primaryFunction?.trim()) {
      findings.push({
        code: "NO_PRIMARY_FUNCTION",
        severity: "WARNING",
        roomId: room.id,
        message: `Room ${room.id} has no declared primary function.`,
        scoreImpact: 15,
      });
    }

    if (room.placedElementCount === 0) {
      findings.push({
        code: "EMPTY_ROOM",
        severity: "WARNING",
        roomId: room.id,
        message: `Room ${room.id} has no placed design elements.`,
        scoreImpact: 20,
      });
    }

    if (room.functionalElementIds.length === 0) {
      findings.push({
        code: "LOW_FUNCTIONAL_COVERAGE",
        severity: "WARNING",
        roomId: room.id,
        message: `Room ${room.id} has no elements mapped to its functional needs.`,
        scoreImpact: 15,
      });
    }

    const density =
      room.areaMinor > 0n
        ? Number(room.placedElementCount) / Number(room.areaMinor)
        : 0;
    if (density > 0.00005) {
      findings.push({
        code: "ROOM_OVERFILLED",
        severity: "WARNING",
        roomId: room.id,
        message: `Room ${room.id} appears overfilled for its recorded area.`,
        scoreImpact: 10,
      });
    }
  }

  const score = Math.max(
    0,
    100 - findings.reduce((total, finding) => total + finding.scoreImpact, 0),
  );
  return {
    score,
    findings,
    summary:
      findings.length === 0
        ? "Design passes the deterministic quality advisor."
        : `${findings.length} design-quality issue(s) require review.`,
  };
};
