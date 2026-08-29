import { describe, expect, it } from "vitest";
import { advanceProcurement } from "./procurementFlow";

describe("advanceProcurement", () => {
  it("enforces RFQ through order progression", () => {
    const atRfq = advanceProcurement([], {
      stage: "RFQ_READY",
      occurredAt: new Date(),
      actorId: "user-1",
    });
    const sent = advanceProcurement(atRfq, {
      stage: "RFQ_SENT",
      occurredAt: new Date(),
      actorId: "user-1",
    });
    const quoted = advanceProcurement(sent, {
      stage: "QUOTE_RECEIVED",
      occurredAt: new Date(),
      actorId: "supplier-1",
    });
    const approved = advanceProcurement(quoted, {
      stage: "APPROVED",
      occurredAt: new Date(),
      actorId: "user-1",
    });
    const ordered = advanceProcurement(approved, {
      stage: "ORDERED",
      occurredAt: new Date(),
      actorId: "user-1",
    });
    expect(ordered.map((event) => event.stage)).toEqual([
      "RFQ_READY",
      "RFQ_SENT",
      "QUOTE_RECEIVED",
      "APPROVED",
      "ORDERED",
    ]);
  });

  it("rejects skipping approval", () => {
    const quoted = advanceProcurement([], {
      stage: "RFQ_READY",
      occurredAt: new Date(),
      actorId: "user-1",
    });
    expect(() =>
      advanceProcurement(quoted, {
        stage: "ORDERED",
        occurredAt: new Date(),
        actorId: "user-1",
      }),
    ).toThrow("invalid procurement transition");
  });
});
