import { describe, expect, it } from "vitest";

import {
  normalizeMarketRecord,
  normalizeMarketRecords,
  type RawMarketRecord,
} from "./ingestion";
import type { MarketSourceDefinition } from "./sourceRegistry";

const source: MarketSourceDefinition = {
  key: "test-source",
  canonicalName: "Test Source",
  domain: "example.com",
  sourceType: "MANUFACTURER",
  categories: ["furniture"],
  geography: "IN",
  acquisitionMethod: "MANUAL_IMPORT",
  ingestionEligible: true,
};

const record = (overrides: Partial<RawMarketRecord> = {}): RawMarketRecord => ({
  sourceKey: source.key,
  sourceUrl: "https://example.com/products/chair-1",
  externalId: " chair-1 ",
  fetchedAt: new Date("2026-08-24T10:00:00.000Z"),
  name: "  Oak Dining Chair  ",
  brand: "  Example Brand ",
  category: "furniture",
  currency: "INR",
  attributes: { material: "oak" },
  ...overrides,
});

describe("market ingestion normalization", () => {
  it("normalizes identity fields and preserves product evidence", () => {
    const product = normalizeMarketRecord(source, record());

    expect(product.externalId).toBe("chair-1");
    expect(product.name).toBe("Oak Dining Chair");
    expect(product.normalizedName).toBe("oak dining chair");
    expect(product.brand).toBe("Example Brand");
    expect(product.canonicalKey).toBe(
      "test-source:chair-1:example brand:oak dining chair",
    );
    expect(product.sourceUrl).toBe("https://example.com/products/chair-1");
    expect(product.observedAt.toISOString()).toBe("2026-08-24T10:00:00.000Z");
  });

  it("rejects unknown sources", () => {
    expect(() =>
      normalizeMarketRecord(undefined, record({ sourceKey: "unknown" })),
    ).toThrow("Unknown market source: unknown");
  });

  it("rejects sources that are not explicitly eligible", () => {
    expect(() =>
      normalizeMarketRecord({ ...source, ingestionEligible: false }, record()),
    ).toThrow("Market source is not ingestion eligible: test-source");
  });

  it("rejects non-HTTPS evidence URLs", () => {
    expect(() =>
      normalizeMarketRecord(
        source,
        record({ sourceUrl: "http://example.com/item" }),
      ),
    ).toThrow("Market source URL must use HTTPS");
  });

  it("rejects records without an external ID or product name", () => {
    expect(() =>
      normalizeMarketRecord(source, record({ externalId: " " })),
    ).toThrow("Market records require an external ID and name");
    expect(() => normalizeMarketRecord(source, record({ name: " " }))).toThrow(
      "Market records require an external ID and name",
    );
  });

  it("deduplicates normalized records by canonical identity", () => {
    const first = record();
    const second = record({
      name: "Oak Dining Chair",
      brand: "Example Brand",
      priceMinor: 129900n,
    });

    expect(normalizeMarketRecords([source], [first, second])).toHaveLength(1);
  });

  it("retains distinct external products from the same source", () => {
    const first = record();
    const second = record({ externalId: "chair-2" });

    expect(normalizeMarketRecords([source], [first, second])).toHaveLength(2);
  });
});
