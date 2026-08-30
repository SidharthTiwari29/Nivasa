import { describe, expect, it } from "vitest";
import {
  canTransitionExecution,
  transitionExecution,
} from "./executionWorkflow";

describe("execution workflow", () => {
  it("moves through the controlled execution lifecycle", () => {
    let state = "DRAFT" as const;
    state = transitionExecution(state, "SUBMIT");
    expect(state).toBe("READY");
    state = transitionExecution(state, "SUBMIT");
    expect(state).toBe("APPROVAL_PENDING");
    state = transitionExecution(state, "APPROVE");
    expect(state).toBe("APPROVED");
    state = transitionExecution(state, "START");
    expect(state).toBe("IN_PROGRESS");
    state = transitionExecution(state, "COMPLETE");
    expect(state).toBe("COMPLETED");
  });

  it("rejects invalid transitions and terminal mutation", () => {
    expect(canTransitionExecution("DRAFT", "APPROVE")).toBe(false);
    expect(() => transitionExecution("DRAFT", "APPROVE")).toThrow(
      "INVALID_EXECUTION_TRANSITION:DRAFT:APPROVE",
    );
    expect(canTransitionExecution("COMPLETED", "CANCEL")).toBe(false);
  });

  it("allows cancellation before completion", () => {
    expect(transitionExecution("DRAFT", "CANCEL")).toBe("CANCELLED");
    expect(transitionExecution("IN_PROGRESS", "CANCEL")).toBe("CANCELLED");
  });
});
