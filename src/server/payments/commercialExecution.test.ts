import { describe, expect, it } from "vitest";
import {
  canTransitionCommercial,
  transitionCommercial,
} from "./commercialExecution";

describe("commercial execution", () => {
  it("moves from quote acceptance through payment", () => {
    expect(transitionCommercial("QUOTED", "ACCEPT")).toBe("ACCEPTED");
    expect(transitionCommercial("ACCEPTED", "INVOICE")).toBe("INVOICED");
    expect(transitionCommercial("INVOICED", "MARK_PAID")).toBe("PAID");
  });

  it("allows cancellation before payment", () => {
    expect(transitionCommercial("QUOTED", "CANCEL")).toBe("CANCELLED");
    expect(transitionCommercial("ACCEPTED", "CANCEL")).toBe("CANCELLED");
    expect(transitionCommercial("INVOICED", "CANCEL")).toBe("CANCELLED");
  });

  it("rejects invalid and terminal transitions", () => {
    expect(canTransitionCommercial("QUOTED", "INVOICE")).toBe(false);
    expect(() => transitionCommercial("PAID", "CANCEL")).toThrow(
      "INVALID_COMMERCIAL_TRANSITION:PAID:CANCEL",
    );
  });
});
