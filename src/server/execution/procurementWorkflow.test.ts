import { describe, expect, it } from "vitest";
import { assessForRfq, assessSupplierQuote } from "./procurementWorkflow";

describe("procurement workflow", () => {
  const lines = [
    {
      catalogueItemId: "item-1",
      quantity: 1,
      unitPriceMinor: 10000n,
      evidenceId: "ev-1",
    },
  ];

  it("does not allow RFQ before buildability and evidence gates pass", () => {
    expect(assessForRfq(lines, false)).toEqual({
      decision: "BLOCKED",
      missing: ["BUILDABILITY_BLOCKER"],
    });
    expect(assessForRfq(lines, true).decision).toBe("READY_FOR_RFQ");
  });

  it("accepts a valid, unexpired supplier quote after readiness", () => {
    const result = assessSupplierQuote(
      lines,
      true,
      {
        id: "quote-1",
        supplierId: "supplier-1",
        currency: "INR",
        expiresAt: new Date("2026-12-01"),
        lines: [
          { catalogueItemId: "item-1", quantity: 1, unitPriceMinor: 9500n },
        ],
      },
      new Date("2026-08-26"),
    );
    expect(result.decision).toBe("QUOTE_ACCEPTABLE");
    expect(result.quoteTotalMinor).toBe(9500n);
  });
});
