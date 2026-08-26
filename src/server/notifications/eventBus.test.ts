import { describe, expect, it } from "vitest";
import { createNotificationEvent } from "./eventBus";

describe("notification domain events", () => {
  it("creates immutable event data", () => {
    const event = createNotificationEvent({ type: "BUDGET_SAVING", saving: 12500 });
    expect(event).toEqual({ type: "BUDGET_SAVING", saving: 12500 });
  });
});
