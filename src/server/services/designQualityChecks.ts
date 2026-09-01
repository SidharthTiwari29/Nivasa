export type QualitySeverity = "INFO" | "WARNING" | "RISK";

export type QualityFlag = {
  code: string;
  severity: QualitySeverity;
  message: string;
  roomId?: string;
};

// README §4: "The system should be capable of identifying poor or risky
// decisions... explain why an alternative may be better." These checks are
// deliberately built only on data this schema actually has reliably
// structured (Room.areaSqFt, RoomUnderstanding.status/confidenceBps,
// budget totals) - RoomUnderstanding.dimensions/geometry/constraints are
// unstructured Json with no guaranteed shape, so building ergonomic/
// clearance simulation on top of them would mean assuming a schema this
// system doesn't actually enforce, which is exactly the "fabricated
// certainty" §46 prohibits. Each check below is a plain, explainable,
// deterministic rule - not a simulation of physical space.

// Minimum functional area, per room type, below which the room is likely
// too small for its stated purpose - conservative, widely-cited interior
// design minimums for Indian residential layouts, not a precise ergonomic
// calculation.
const MIN_AREA_SQFT: Partial<Record<string, number>> = {
  BEDROOM: 80,
  KITCHEN: 50,
  BATHROOM: 25,
  LIVING_ROOM: 120,
  DINING_ROOM: 60,
  STUDY: 40,
};

export function checkRoomAreaAdequacy(
  roomId: string,
  roomType: string,
  areaSqFt: number | null,
): QualityFlag[] {
  if (areaSqFt === null) {
    return [
      {
        code: "ROOM_AREA_UNKNOWN",
        severity: "INFO",
        message:
          "Room area has not been recorded - area-based design checks cannot run for this room yet",
        roomId,
      },
    ];
  }
  const minimum = MIN_AREA_SQFT[roomType];
  if (minimum !== undefined && areaSqFt < minimum) {
    return [
      {
        code: "ROOM_AREA_BELOW_MINIMUM",
        severity: "RISK",
        message: `Room area (${areaSqFt} sq ft) is below the typical functional minimum for a ${roomType.toLowerCase().replace("_", " ")} (${minimum} sq ft) - furniture and circulation may be cramped`,
        roomId,
      },
    ];
  }
  return [];
}

export function checkRoomUnderstandingConfidence(
  roomId: string,
  status: string,
  confidenceBps: number | null,
): QualityFlag[] {
  const flags: QualityFlag[] = [];
  if (status !== "CONFIRMED") {
    flags.push({
      code: "ROOM_UNDERSTANDING_UNCONFIRMED",
      severity: "WARNING",
      message:
        "This room's spatial understanding has not been confirmed by the user - design decisions for it are based on unverified/inferred data",
      roomId,
    });
  }
  // 70% confidence threshold: below this, the underlying inference is
  // explicitly flagged rather than silently treated as reliable, matching
  // §3's "INFERRED → CONFIDENCE → USER CONFIRMATION" principle.
  if (confidenceBps !== null && confidenceBps < 7000) {
    flags.push({
      code: "ROOM_UNDERSTANDING_LOW_CONFIDENCE",
      severity: "WARNING",
      message: `Room understanding confidence is low (${(confidenceBps / 100).toFixed(1)}%) - consider confirming or re-running spatial analysis before finalizing design`,
      roomId,
    });
  }
  return flags;
}

// A per-sq-ft budget dramatically outside a plausible range for Indian
// residential interior work is a signal worth surfacing to the user before
// they lock a budget they may not be able to execute against - not a claim
// about what any specific design *should* cost, only that the figure is
// worth a second look.
const PLAUSIBLE_PER_SQFT_MINOR_RANGE = {
  low: 50_000, // ₹500/sqft - implausibly low for a full interior fit-out
  high: 5_000_000, // ₹50,000/sqft - implausibly high outside ultra-luxury
};

export function checkBudgetRealism(
  targetTotalMinor: bigint,
  totalAreaSqFt: number,
): QualityFlag[] {
  if (totalAreaSqFt <= 0) return [];
  const perSqFtMinor = Number(targetTotalMinor) / totalAreaSqFt;
  if (perSqFtMinor < PLAUSIBLE_PER_SQFT_MINOR_RANGE.low) {
    return [
      {
        code: "BUDGET_IMPLAUSIBLY_LOW",
        severity: "RISK",
        message:
          "The target budget per square foot is unusually low for a full interior fit-out - this budget may not be achievable for the scope described",
      },
    ];
  }
  if (perSqFtMinor > PLAUSIBLE_PER_SQFT_MINOR_RANGE.high) {
    return [
      {
        code: "BUDGET_IMPLAUSIBLY_HIGH",
        severity: "INFO",
        message:
          "The target budget per square foot is unusually high - worth confirming this reflects an intentional ultra-premium scope",
      },
    ];
  }
  return [];
}

type RoomDimensions = {
  lengthFt?: number;
  widthFt?: number;
  doors?: Array<{ widthFt: number }>;
};

// This check only exists because RoomUnderstanding.dimensions is now a
// structured, validated schema instead of an arbitrary Json blob - reading
// specific keys out of unstructured data would have meant guessing at a
// shape nothing actually enforced. A door narrower than a reasonable
// standard width relative to the room's own recorded dimensions is worth
// surfacing before a design assumes standard furniture will fit through it.
const MIN_STANDARD_DOOR_WIDTH_FT = 2.5;

export function checkDoorClearance(
  roomId: string,
  dimensions: RoomDimensions | null,
): QualityFlag[] {
  if (!dimensions?.doors?.length) return [];
  const narrowDoors = dimensions.doors.filter(
    (d) => d.widthFt < MIN_STANDARD_DOOR_WIDTH_FT,
  );
  if (narrowDoors.length === 0) return [];
  return [
    {
      code: "DOOR_WIDTH_BELOW_STANDARD",
      severity: "WARNING",
      message: `${narrowDoors.length} door(s) in this room are narrower than the standard ${MIN_STANDARD_DOOR_WIDTH_FT} ft - larger furniture may not fit through during move-in`,
      roomId,
    },
  ];
}
