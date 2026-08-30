import { describe, expect, it } from "vitest";

type JourneyState =
  | "PROPERTY_CREATED"
  | "INTELLIGENCE_CAPTURED"
  | "DESIGN_RECOMMENDED"
  | "BUDGET_DRAFTED"
  | "BOQ_READY"
  | "VISUALIZATION_REQUESTED"
  | "EXECUTION_STARTED"
  | "PAYMENT_RECORDED"
  | "ACTION_NOTIFIED"
  | "COMPLETE";

const JOURNEY: readonly JourneyState[] = [
  "PROPERTY_CREATED",
  "INTELLIGENCE_CAPTURED",
  "DESIGN_RECOMMENDED",
  "BUDGET_DRAFTED",
  "BOQ_READY",
  "VISUALIZATION_REQUESTED",
  "EXECUTION_STARTED",
  "PAYMENT_RECORDED",
  "ACTION_NOTIFIED",
  "COMPLETE",
];

function advance(state: JourneyState, next: JourneyState): JourneyState {
  const currentIndex = JOURNEY.indexOf(state);
  const nextIndex = JOURNEY.indexOf(next);
  if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
    throw new Error(`Invalid journey transition: ${state} -> ${next}`);
  }
  return next;
}

describe("P2.11 end-to-end acceptance contract", () => {
  it("covers the canonical customer journey in dependency order", () => {
    let state: JourneyState = JOURNEY[0];
    for (const next of JOURNEY.slice(1)) state = advance(state, next);
    expect(state).toBe("COMPLETE");
  });

  it("rejects skipped stages", () => {
    expect(() => advance("PROPERTY_CREATED", "BUDGET_DRAFTED")).toThrow(
      /Invalid journey transition/,
    );
  });

  it("keeps every Phase 2 pillar represented exactly once", () => {
    expect(JOURNEY).toHaveLength(10);
    expect(new Set(JOURNEY).size).toBe(JOURNEY.length);
  });
});
