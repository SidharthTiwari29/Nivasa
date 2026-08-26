import { describe, expect, it } from "vitest";
import { notificationEventFromDomainEvent } from "./notificationBridge";

describe("notificationEventFromDomainEvent", () => {
  it("maps savings to playful notifications", () => {
    expect(notificationEventFromDomainEvent({ type: "BUDGET_SAVING", saving: 5000 })).toEqual({ key: "BUDGET_SAVING", tone: "PLAYFUL", variables: { saving: 5000 } });
  });

  it("maps build blockers to urgent notifications", () => {
    expect(notificationEventFromDomainEvent({ type: "BUILD_BLOCKER", message: "clearance" }).tone).toBe("URGENT");
  });
});
