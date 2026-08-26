import { describe, expect, it } from "vitest";
import { rankMarketOptions } from "./intelligenceService";
import type { MarketObservation } from "./source-domain";

const observation = (id: string, amountMinor: bigint, confidenceBps: number, available = true): MarketObservation => ({
  observationId: id,
  canonicalProductId: "product-1",
  source: { sourceId: `source-${id}`, kind: "RETAILER", name: `Retailer ${id}` },
  evidence: {
    evidenceId: `evidence-${id}`,
    source: { sourceId: `source-${id}`, kind: "RETAILER", name: `Retailer ${id}` },
    observedAt: new Date("2026-08-26T00:00:00.000Z"),
  },
  amountMinor,
  currency: "INR",
  available,
  confidenceBps,
  truth: "VERIFIED",
});

describe("rankMarketOptions", () => {
  it("prefers lower priced, available, high-confidence options", () => {
    const result = rankMarketOptions(100_000n, [
      observation("a", 80_000n, 9_500),
      observation("b", 70_000n, 8_000),
    ]);

    expect(result[0]?.observation.observationId).toBe("a");
    expect(result[0]?.savingMinor).toBe(20_000n);
  });

  it("rejects invalid confidence", () => {
    expect(() => rankMarketOptions(100n, [observation("bad", 50n, 10_001)])).toThrow(
      "confidenceBps must be an integer between 0 and 10000",
    );
  });

  it("handles unavailable options deterministically", () => {
    const result = rankMarketOptions(100n, [
      observation("available", 90n, 9_000, true),
      observation("unavailable", 50n, 9_500, false),
    ]);

    expect(result[0]?.observation.observationId).toBe("available");
  });
});
