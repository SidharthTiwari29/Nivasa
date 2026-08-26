import { describe, expect, it } from "vitest";
import { advanceProcurement } from "./procurementService";

const request = {
  id: "proc-1",
  projectId: "project-1",
  boqId: "boq-1",
  state: "DRAFT" as const,
  items: [
    {
      catalogueItemId: "item-1",
      quantity: 2,
      unitPriceMinor: 10000n,
      evidenceId: "e-1",
    },
  ],
};

describe("procurement lifecycle", () => {
  it("moves through the RFQ lifecycle without allowing skipped states", () => {
    const ready = advanceProcurement(request, "RFQ_READY");
    const sent = advanceProcurement(ready, "RFQ_SENT");
    expect(sent.state).toBe("RFQ_SENT");
    expect(() => advanceProcurement(sent, "ORDERED")).toThrow(
      "invalid procurement transition",
    );
  });

  it("requires price evidence", () => {
    expect(() =>
      advanceProcurement(
        { ...request, items: [{ ...request.items[0], evidenceId: "" }] },
        "RFQ_READY",
      ),
    ).toThrow("price evidence is required");
  });
});
