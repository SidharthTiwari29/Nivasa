import { describe, expect, it } from "vitest";

import {
  auditSourceCatalog,
  MARKET_SOURCE_CATALOG,
  MARKET_SOURCE_CATEGORIES,
  MARKET_SOURCE_TARGET,
} from "./sourceCatalog";

describe("market source catalog", () => {
  it("contains the researched expansion universe", () => {
    expect(MARKET_SOURCE_CATALOG.length).toBeGreaterThan(150);
    expect(MARKET_SOURCE_TARGET).toBe(500);
  });

  it("covers every supported interior category", () => {
    const audit = auditSourceCatalog();
    expect(audit.missingCategories).toEqual([]);
    expect(MARKET_SOURCE_CATEGORIES).toHaveLength(19);
  });

  it("does not contain duplicate source keys", () => {
    expect(auditSourceCatalog().duplicateKeys).toEqual([]);
  });

  it("does not contain malformed source domains", () => {
    expect(auditSourceCatalog().invalidDomains).toEqual([]);
  });

  it("keeps newly researched sources non-ingestion-eligible by default", () => {
    expect(auditSourceCatalog().ingestionEligibleCount).toBeLessThan(
      MARKET_SOURCE_CATALOG.length,
    );
  });
});
