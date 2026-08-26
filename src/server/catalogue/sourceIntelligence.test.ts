import { describe, expect, it } from "vitest";
import {
  classifyPriceObservation,
  potentialSavingMinor,
  validateConfidenceBps,
} from "./sourceIntelligence";

describe("source intelligence domain contract", () => {
  it("accepts confidence in basis points from 0 through 10000", () => {
    expect(() => validateConfidenceBps(0)).not.toThrow();
    expect(() => validateConfidenceBps(10_000)).not.toThrow();
  });

  it("rejects invalid confidence values", () => {
    expect(() => validateConfidenceBps(-1)).toThrow(
      "CONFIDENCE_BPS_OUT_OF_RANGE",
    );
    expect(() => validateConfidenceBps(10_001)).toThrow(
      "CONFIDENCE_BPS_OUT_OF_RANGE",
    );
    expect(() => validateConfidenceBps(12.5)).toThrow(
      "CONFIDENCE_BPS_OUT_OF_RANGE",
    );
  });

  it("does not call an unverified amount a verified price", () => {
    expect(
      classifyPriceObservation({
        amountMinor: 12_000n,
        truthClass: "AI_INFERRED",
      }),
    ).toBe("UNKNOWN_PRICE");
  });

  it("classifies source-backed prices as verified", () => {
    expect(
      classifyPriceObservation({
        amountMinor: 12_000n,
        truthClass: "SOURCE_VERIFIED",
      }),
    ).toBe("VERIFIED_PRICE");
  });

  it("calculates only positive potential savings", () => {
    expect(
      potentialSavingMinor({
        currentAmountMinor: 15_000n,
        alternativeAmountMinor: 12_500n,
      }),
    ).toBe(2_500n);
    expect(
      potentialSavingMinor({
        currentAmountMinor: 12_500n,
        alternativeAmountMinor: 15_000n,
      }),
    ).toBe(0n);
  });
});
