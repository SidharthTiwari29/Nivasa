import { describe, expect, it } from "vitest";
import { calculateQuoteTotal } from "./quote";

describe("calculateQuoteTotal", () => {
  it("calculates an evidence-ready quote total deterministically", () => {
    const result = calculateQuoteTotal(
      {
        id: "q1",
        supplierId: "s1",
        currency: "INR",
        expiresAt: new Date("2026-12-01"),
        lines: [
          { catalogueItemId: "item-1", quantity: 2, unitPriceMinor: 15000n },
        ],
      },
      new Date("2026-08-26"),
    );
    expect(result).toEqual({ subtotalMinor: 30000n, currency: "INR" });
  });

  it("rejects expired quotes", () => {
    expect(() =>
      calculateQuoteTotal(
        {
          id: "q1",
          supplierId: "s1",
          currency: "INR",
          expiresAt: new Date("2026-08-01"),
          lines: [
            { catalogueItemId: "item-1", quantity: 1, unitPriceMinor: 10n },
          ],
        },
        new Date("2026-08-26"),
      ),
    ).toThrow("quote expired");
  });
});
