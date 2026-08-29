import { describe, expect, it } from "vitest";
import { validateQuote } from "./quotePolicy";

describe("validateQuote", () => {
  it("accepts an evidence-backed unexpired quote", () => {
    const result = validateQuote(
      {
        supplierId: "supplier-1",
        validUntil: new Date("2030-01-01"),
        lines: [
          {
            catalogueItemId: "item-1",
            quantity: 2,
            unitPriceMinor: 5000n,
            evidenceId: "e-1",
          },
        ],
      },
      new Date("2029-01-01"),
    );
    expect(result.valid).toBe(true);
    expect(result.totalMinor).toBe(10000n);
  });

  it("rejects expired or unsupported quotes", () => {
    const result = validateQuote(
      {
        supplierId: "supplier-1",
        validUntil: new Date("2020-01-01"),
        lines: [
          {
            catalogueItemId: "item-1",
            quantity: 1,
            unitPriceMinor: 5000n,
            evidenceId: "",
          },
        ],
      },
      new Date("2021-01-01"),
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      "QUOTE_EXPIRED",
      "LINE_0_EVIDENCE_REQUIRED",
    ]);
  });
});
