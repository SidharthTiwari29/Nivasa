import { describe, expect, it } from "vitest";
import {
  assertPriceSemantics,
  classifyPrice,
  isPriceFresh,
  normalizeQuantity,
  normalizeUnit,
} from "./marketSemantics";

describe("market semantics", () => {
  it("normalizes common units and aliases", () => {
    expect(normalizeUnit("sq. ft")).toBe("sqft");
    expect(normalizeUnit("kilograms")).toBe("kg");
    expect(normalizeUnit("PCS")).toBe("piece");
  });

  it("converts only compatible dimensions", () => {
    expect(normalizeQuantity(10, "sqm", "sqft")).toBeCloseTo(107.6391, 3);
    expect(normalizeQuantity(1000, "g", "kg")).toBe(1);
    expect(() => normalizeQuantity(1, "kg", "sqft")).toThrow(
      "Incompatible market units",
    );
  });

  it("classifies price semantics conservatively", () => {
    expect(
      classifyPrice({
        amountMinor: 10000n,
        mrpMinor: 12000n,
        sourceKind: "OFFICIAL",
        unit: "piece",
      }),
    ).toBe("OBSERVED_SELLING");
    expect(
      classifyPrice({
        amountMinor: 12000n,
        mrpMinor: 12000n,
        sourceKind: "OFFICIAL",
        unit: "piece",
      }),
    ).toBe("LIST_MRP");
    expect(
      classifyPrice({
        amountMinor: 9000n,
        sourceKind: "INFERRED",
        unit: "piece",
      }),
    ).toBe("INDICATIVE");
  });

  it("rejects invalid freshness and geography semantics", () => {
    const observedAt = new Date("2026-08-29T00:00:00Z");
    expect(() =>
      assertPriceSemantics({
        priceType: "OBSERVED_SELLING",
        amountMinor: 100n,
        currency: "INR",
        unit: "piece",
        taxIncluded: true,
        shippingIncluded: false,
        installationIncluded: false,
        geography: "Bengaluru",
        observedAt,
        freshUntil: new Date("2026-08-28T00:00:00Z"),
      }),
    ).toThrow("freshness");

    expect(() =>
      assertPriceSemantics({
        priceType: "DEALER_QUOTE",
        amountMinor: 100n,
        currency: "INR",
        unit: "piece",
        taxIncluded: null,
        shippingIncluded: null,
        installationIncluded: null,
        geography: null,
        observedAt,
        freshUntil: null,
      }),
    ).toThrow("geography");
  });

  it("treats a missing freshness deadline as non-expiring but expired deadlines as stale", () => {
    const now = new Date("2026-08-29T00:00:00Z");
    expect(isPriceFresh({ freshUntil: null }, now)).toBe(true);
    expect(
      isPriceFresh({ freshUntil: new Date("2026-08-28T23:59:59Z") }, now),
    ).toBe(false);
  });
});
