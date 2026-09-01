import { describe, expect, it } from "vitest";
import { evaluateNegotiation } from "./negotiationEngine";

// Reference quote: ₹10,000 total, 10% commission, 5% minimum margin floor.
// Max concession = 10% - 5% = 5% of ₹10,000 = ₹500.
// Floor = ₹10,000 - ₹500 = ₹9,500 = 950,000 paise.
const referenceQuote = {
  totalAmountMinor: 1_000_000n,
  nivasaCommissionBps: 1000,
  minMarginBps: 500,
};

describe("evaluateNegotiation", () => {
  it("accepts a proposal exactly at the computed margin floor", () => {
    const result = evaluateNegotiation(referenceQuote, 950_000n);
    expect(result.decision).toBe("ACCEPTED");
  });

  it("accepts a proposal above the floor", () => {
    const result = evaluateNegotiation(referenceQuote, 980_000n);
    expect(result.decision).toBe("ACCEPTED");
  });

  it("counters a proposal below the floor with the floor amount itself", () => {
    const result = evaluateNegotiation(referenceQuote, 900_000n);
    expect(result.decision).toBe("COUNTERED");
    expect(result.counterAmountMinor).toBe(950_000n);
  });

  it("never counters with an amount below the computed floor, regardless of how low the proposal is", () => {
    const result = evaluateNegotiation(referenceQuote, 1n);
    expect(result.decision).toBe("COUNTERED");
    expect(result.counterAmountMinor).toBe(950_000n);
  });

  it("rejects a proposal at or above the current quote total (not a real negotiation)", () => {
    const atTotal = evaluateNegotiation(referenceQuote, 1_000_000n);
    expect(atTotal.decision).toBe("REJECTED");

    const aboveTotal = evaluateNegotiation(referenceQuote, 1_100_000n);
    expect(aboveTotal.decision).toBe("REJECTED");
  });

  it("rejects a zero or negative proposal", () => {
    expect(evaluateNegotiation(referenceQuote, 0n).decision).toBe("REJECTED");
    expect(evaluateNegotiation(referenceQuote, -100n).decision).toBe(
      "REJECTED",
    );
  });

  it("treats commission equal to minimum margin as zero concession room (floor equals the full total)", () => {
    const noRoomQuote = {
      totalAmountMinor: 1_000_000n,
      nivasaCommissionBps: 500,
      minMarginBps: 500,
    };
    const result = evaluateNegotiation(noRoomQuote, 900_000n);
    expect(result.decision).toBe("COUNTERED");
    expect(result.counterAmountMinor).toBe(1_000_000n);
  });

  it("never lets the floor go negative even if minMarginBps exceeds commissionBps (misconfiguration guard)", () => {
    const misconfigured = {
      totalAmountMinor: 1_000_000n,
      nivasaCommissionBps: 500,
      minMarginBps: 2000, // higher than commission - should clamp, not go negative
    };
    const result = evaluateNegotiation(misconfigured, 900_000n);
    // maxConcessionBps clamps to 0, so floor = full total - no concession possible.
    expect(result.counterAmountMinor).toBe(1_000_000n);
  });
});
