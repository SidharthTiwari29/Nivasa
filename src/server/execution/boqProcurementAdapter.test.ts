import { describe, expect, it } from "vitest";
import { assessFinalizedBoqForProcurement, procurementLinesFromBoq } from "./boqProcurementAdapter";

describe("BOQ procurement adapter", () => {
  const boq = { status: "FINALIZED" as const, lines: [{ catalogueItemId: "item-1", quantity: 2, unitPriceMinor: 100n, evidenceId: "evidence-1" }] };

  it("converts a finalized BOQ into procurement lines", () => {
    expect(procurementLinesFromBoq(boq)).toEqual([{ catalogueItemId: "item-1", quantity: 2, unitPriceMinor: 100n, evidenceId: "evidence-1" }]);
  });

  it("blocks procurement from a draft BOQ", () => {
    expect(() => procurementLinesFromBoq({ ...boq, status: "DRAFT" })).toThrow("BOQ must be finalized");
  });

  it("passes buildability and evidence gates together", () => {
    expect(assessFinalizedBoqForProcurement(boq, true)).toEqual({ ready: true, missing: [] });
    expect(assessFinalizedBoqForProcurement(boq, false)).toEqual({ ready: false, missing: ["BUILDABILITY_BLOCKER"] });
  });
});
