import { describe, expect, it } from "vitest";
import { calculateWhatIf } from "./whatIfService";

describe("calculateWhatIf", () => {
  it("calculates total and savings without mutation", () => {
    const lines = [
      { id: "kitchen", label: "Kitchen", currentMinor: 100_000n, alternativeMinor: 80_000n, confidenceBps: 9_500 },
      { id: "lighting", label: "Lighting", currentMinor: 50_000n, alternativeMinor: 45_000n, confidenceBps: 9_000 },
    ];
    const result = calculateWhatIf(lines);
    expect(result.currentTotalMinor).toBe(150_000n);
    expect(result.alternativeTotalMinor).toBe(125_000n);
    expect(result.savingMinor).toBe(25_000n);
    expect(result.savingBps).toBe(1666);
    expect(lines).toHaveLength(2);
  });

  it("does not report negative savings", () => {
    const result = calculateWhatIf([
      { id: "x", label: "X", currentMinor: 10n, alternativeMinor: 20n, confidenceBps: 10_000 },
    ]);
    expect(result.savingMinor).toBe(0n);
    expect(result.savingBps).toBe(0);
  });

  it("rejects invalid confidence and prices", () => {
    expect(() => calculateWhatIf([
      { id: "x", label: "X", currentMinor: 1n, alternativeMinor: 1n, confidenceBps: 10_001 },
    ])).toThrow();
    expect(() => calculateWhatIf([
      { id: "x", label: "X", currentMinor: -1n, alternativeMinor: 1n, confidenceBps: 1 },
    ])).toThrow("scenario prices cannot be negative");
  });
});
