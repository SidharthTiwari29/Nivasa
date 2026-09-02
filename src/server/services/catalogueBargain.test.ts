import { describe, expect, it } from "vitest";
import { evaluateCatalogueBargain } from "./catalogueBargain";

describe("evaluateCatalogueBargain", () => {
  it("accepts a proposal at exactly the current price when a real standing discount exists", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: 24_000n },
      20_000n,
    );
    expect(result.decision).toBe("ACCEPTED");
  });

  it("accepts a proposal above the current price when a real standing discount exists", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: 24_000n },
      22_000n,
    );
    expect(result.decision).toBe("ACCEPTED");
  });

  it("rejects a proposal below the current price even when a real standing discount exists - zero margin floor", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: 24_000n },
      19_000n,
    );
    expect(result.decision).toBe("REJECTED");
    expect(result.reason).toContain("zero margin");
  });

  it("rejects any proposal when MRP equals the current price - no real discount to draw from", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: 20_000n },
      20_000n, // even a proposal AT the price is rejected, since there's no discount precedent at all
    );
    expect(result.decision).toBe("REJECTED");
    expect(result.reason).toContain("no standing brand discount");
  });

  it("rejects any proposal when no MRP is on record at all", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: null },
      15_000n,
    );
    expect(result.decision).toBe("REJECTED");
    expect(result.reason).toContain("no standing brand discount");
  });

  it("rejects when MRP is lower than the current price (a data anomaly, never treated as a discount)", () => {
    const result = evaluateCatalogueBargain(
      { unitPriceMinor: 20_000n, mrpMinor: 18_000n },
      18_000n,
    );
    expect(result.decision).toBe("REJECTED");
  });
});
