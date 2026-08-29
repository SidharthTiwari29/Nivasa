import { describe, expect, it } from "vitest";
import {
  GOVERNED_SOURCE_CATALOG,
  assertSourceCanIngest,
  auditSourceGovernance,
} from "./sourceGovernance";

describe("source governance", () => {
  it("keeps the catalog non-ingestible until each source is individually approved", () => {
    const audit = auditSourceGovernance();
    expect(audit.total).toBeGreaterThan(0);
    expect(audit.unreviewed.length).toBe(audit.total);
    expect(
      GOVERNED_SOURCE_CATALOG.every((source) => !source.ingestionEligible),
    ).toBe(true);
  });

  it("blocks an unreviewed source from acquisition", () => {
    expect(() => assertSourceCanIngest(GOVERNED_SOURCE_CATALOG[0])).toThrow(
      "access is not approved",
    );
  });

  it("keeps category coverage visible as an explicit audit result", () => {
    expect(auditSourceGovernance().missingCategoryCoverage).toEqual([]);
  });
});
