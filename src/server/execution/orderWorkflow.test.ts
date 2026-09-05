import { describe, expect, it } from "vitest";
import { canTransitionOrder, transitionOrder } from "./orderWorkflow";

describe("orderWorkflow", () => {
  it("allows the normal fulfilment path", () => {
    expect(transitionOrder("PLACED", "CONFIRMED")).toBe("CONFIRMED");
    expect(transitionOrder("CONFIRMED", "DISPATCHED")).toBe("DISPATCHED");
    expect(transitionOrder("DISPATCHED", "DELIVERED")).toBe("DELIVERED");
  });

  it("allows cancellation before delivery but not after", () => {
    expect(canTransitionOrder("PLACED", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("DISPATCHED", "CANCELLED")).toBe(false);
    expect(canTransitionOrder("DELIVERED", "CANCELLED")).toBe(false);
  });

  it("rejects regressions and terminal-state rewrites", () => {
    expect(() => transitionOrder("DELIVERED", "DISPATCHED")).toThrow(
      "INVALID_ORDER_TRANSITION:DELIVERED:DISPATCHED",
    );
    expect(() => transitionOrder("CANCELLED", "CONFIRMED")).toThrow(
      "INVALID_ORDER_TRANSITION:CANCELLED:CONFIRMED",
    );
  });
});
