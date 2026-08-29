import { describe, expect, it } from "vitest";
import { domainEventForExecutionStage } from "./executionNotification";

describe("domainEventForExecutionStage", () => {
  it("emits a quote notification event", () => {
    expect(
      domainEventForExecutionStage("QUOTE_RECEIVED", "kitchen quote"),
    ).toEqual({ type: "QUOTE_RECEIVED", item: "kitchen quote" });
  });

  it("emits installation progress", () => {
    expect(
      domainEventForExecutionStage("INSTALLATION", "wardrobes arriving"),
    ).toEqual({ type: "INSTALLATION_UPDATE", message: "wardrobes arriving" });
  });
});
