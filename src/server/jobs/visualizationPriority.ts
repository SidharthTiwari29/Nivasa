export type RoomConfidenceInput = {
  status: string;
  confidenceBps: number | null;
};

// README's own principle (§3, "INFERRED -> CONFIDENCE -> USER
// CONFIRMATION") applied to job scheduling: a room whose spatial
// understanding is confirmed and high-confidence should render first, so
// the first visualizations a user sees are the ones most likely to be
// trustworthy - not uniformly-confident-looking output regardless of how
// certain the underlying data actually is.
//
// BullMQ's own convention is LOWER number = HIGHER priority (1 runs
// before 10) - this function returns a value already in that scale, so
// callers pass it straight through to Queue.add's priority option without
// having to remember to invert it themselves.
const PRIORITY_CONFIRMED_HIGH_CONFIDENCE = 1;
const PRIORITY_CONFIRMED_LOW_CONFIDENCE = 3;
const PRIORITY_UNCONFIRMED = 5;
const PRIORITY_NO_DATA = 10;

const HIGH_CONFIDENCE_THRESHOLD_BPS = 7000; // 70%, matching the threshold
// already used in checkRoomUnderstandingConfidence's design-quality flag.

export function computeVisualizationPriority(
  room: RoomConfidenceInput | null,
): number {
  if (!room) return PRIORITY_NO_DATA;

  if (room.status !== "CONFIRMED") return PRIORITY_UNCONFIRMED;

  if (
    room.confidenceBps !== null &&
    room.confidenceBps >= HIGH_CONFIDENCE_THRESHOLD_BPS
  ) {
    return PRIORITY_CONFIRMED_HIGH_CONFIDENCE;
  }

  return PRIORITY_CONFIRMED_LOW_CONFIDENCE;
}
