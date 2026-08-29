import { describe, expect, it } from "vitest";

import { marketRepository } from "./marketRepository";

describe("market repository invariants", () => {
  it("rejects negative monetary observations before persistence", async () => {
    await expect(
      marketRepository.appendPriceObservation({
        sourceProductId: "csourceproduct123456789012345",
        observedAt: new Date("2026-08-25T00:00:00.000Z"),
        amountMinor: -1n,
        currency: "INR",
        unit: "piece",
        evidence: {},
        retrievalMethod: "MANUAL_IMPORT",
      }),
    ).rejects.toThrow("AMOUNT_MINOR_MUST_BE_NON_NEGATIVE");
  });

  it("rejects stale freshness windows at write time", async () => {
    await expect(
      marketRepository.appendPriceObservation({
        sourceProductId: "csourceproduct123456789012345",
        observedAt: new Date("2026-08-25T00:00:00.000Z"),
        amountMinor: 10000n,
        currency: "INR",
        unit: "piece",
        freshUntil: new Date("2026-08-24T00:00:00.000Z"),
        evidence: {},
        retrievalMethod: "MANUAL_IMPORT",
      }),
    ).rejects.toThrow("FRESH_UNTIL_CANNOT_PRECEDE_OBSERVED_AT");
  });

  it("rejects invalid confidence values before persistence", async () => {
    await expect(
      marketRepository.appendPriceObservation({
        sourceProductId: "csourceproduct123456789012345",
        observedAt: new Date("2026-08-25T00:00:00.000Z"),
        amountMinor: 10000n,
        currency: "INR",
        unit: "piece",
        confidenceBps: 10001,
        evidence: {},
        retrievalMethod: "MANUAL_IMPORT",
      }),
    ).rejects.toThrow("CONFIDENCE_BPS_OUT_OF_RANGE");
  });

  it("rejects empty commercial units", async () => {
    await expect(
      marketRepository.appendPriceObservation({
        sourceProductId: "csourceproduct123456789012345",
        observedAt: new Date("2026-08-25T00:00:00.000Z"),
        amountMinor: 10000n,
        currency: "INR",
        unit: "   ",
        evidence: {},
        retrievalMethod: "MANUAL_IMPORT",
      }),
    ).rejects.toThrow("PRICE_UNIT_REQUIRED");
  });
});
