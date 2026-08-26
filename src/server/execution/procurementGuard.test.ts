import { describe, expect, it } from "vitest";
import { assessProcurementReadiness } from "./procurementGuard";

describe("assessProcurementReadiness", () => {
  it("requires buildability and evidence-backed prices", () => {
    const result = assessProcurementReadiness([
      { catalogueItemId: "item-1", quantity: 2, unitPriceMinor: 10_000n, evidenceId: "evidence-1" },
    ], true);
    expect(result.ready).toBe(true);
  });

  it("blocks procurement when buildability is blocked", () => {
    const result = assessProcurementReadiness([{ catalogueItemId: "item-1", quantity: 1 }], false);
    expect(result.ready).toBe(false);
    expect(result.missing).toContain("BUILDABILITY_BLOCKER");
  });

  it("requires evidence whenever a price is supplied", () => {
    const result = assessProcurementReadiness([{ catalogueItemId: "item-1", quantity: 1, unitPriceMinor: 5_000n }], true);
    expect(result.missing).toContain("LINE_0_PRICE_EVIDENCE_REQUIRED");
  });
});
