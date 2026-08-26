import { describe, expect, it } from "vitest";
import { advanceExecution } from "./executionPlan";

describe("execution milestones", () => {
  it("advances only through the defined lifecycle", () => {
    const milestones = advanceExecution([], { stage: "DESIGN_APPROVED" });
    const next = advanceExecution(milestones, { stage: "BOQ_LOCKED" });
    expect(next.map((item) => item.stage)).toEqual(["DESIGN_APPROVED", "BOQ_LOCKED"]);
  });

  it("rejects skipping execution stages", () => {
    expect(() => advanceExecution([], { stage: "ORDERED" })).toThrow("invalid execution transition");
  });
});
