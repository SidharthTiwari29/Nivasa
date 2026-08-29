import { describe, expect, it } from "vitest";
import { findDeals } from "./dealService";
import type { MarketObservation } from "./source-domain";

const item = (
  id: string,
  amountMinor: bigint,
  available = true,
): MarketObservation => ({
  observationId: id,
  canonicalProductId: "product-1",
  source: {
    sourceId: `source-${id}`,
    kind: "RETAILER",
    name: `Retailer ${id}`,
  },
  evidence: {
    evidenceId: `evidence-${id}`,
    source: {
      sourceId: `source-${id}`,
      kind: "RETAILER",
      name: `Retailer ${id}`,
    },
    observedAt: new Date("2026-08-26T00:00:00.000Z"),
  },
  amountMinor,
  currency: "INR",
  available,
  confidenceBps: 9_000,
  truth: "VERIFIED",
});

describe("findDeals", () => {
  it("returns available options meeting the saving threshold", () => {
    const deals = findDeals(100_000n, [item("a", 90_000n), item("b", 70_000n)]);
    expect(deals.map((deal) => deal.observation.observationId)).toEqual([
      "b",
      "a",
    ]);
    expect(deals[0]?.savingMinor).toBe(30_000n);
  });

  it("never treats an unavailable option as a deal", () => {
    expect(findDeals(100_000n, [item("unavailable", 50_000n, false)])).toEqual(
      [],
    );
  });

  it("rejects an invalid threshold", () => {
    expect(() => findDeals(100n, [], 10_001)).toThrow(
      "minimumSavingBps must be between 0 and 10000",
    );
  });
});
