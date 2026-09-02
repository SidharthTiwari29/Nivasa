import { describe, expect, it } from "vitest";
import {
  evaluateSourceQuality,
  hasAdequateOptions,
  MINIMUM_ADEQUATE_OPTIONS,
} from "./marketQualityGate";

describe("evaluateSourceQuality", () => {
  it("reports UNKNOWN warranty status when no warranty data has ever been recorded - never silently NO_WARRANTY", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: "Brand A",
      warrantyMonths: null,
    });
    expect(result.warrantyStatus).toBe("UNKNOWN");
  });

  it("reports COVERED when a real, positive warranty period is on record", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: "Brand A",
      warrantyMonths: 12,
    });
    expect(result.warrantyStatus).toBe("COVERED");
  });

  it("reports NO_WARRANTY when the source explicitly recorded zero months - a real, distinct fact from unknown", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: "Brand A",
      warrantyMonths: 0,
    });
    expect(result.warrantyStatus).toBe("NO_WARRANTY");
  });

  it("reports hasBrand false for a null brand", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: null,
      warrantyMonths: 12,
    });
    expect(result.hasBrand).toBe(false);
  });

  it("reports hasBrand false for an empty or whitespace-only brand string", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: "   ",
      warrantyMonths: 12,
    });
    expect(result.hasBrand).toBe(false);
  });

  it("reports hasBrand true for a real brand name", () => {
    const result = evaluateSourceQuality({
      itemId: "item-1",
      brand: "Brand A",
      warrantyMonths: 12,
    });
    expect(result.hasBrand).toBe(true);
  });
});

describe("hasAdequateOptions", () => {
  it("requires at least the defined minimum (2) real options to count as adequate choice", () => {
    expect(MINIMUM_ADEQUATE_OPTIONS).toBe(2);
    expect(hasAdequateOptions(2)).toBe(true);
    expect(hasAdequateOptions(1)).toBe(false);
    expect(hasAdequateOptions(0)).toBe(false);
  });

  it("treats any count above the minimum as adequate too", () => {
    expect(hasAdequateOptions(10)).toBe(true);
  });
});
