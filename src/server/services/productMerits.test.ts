import { describe, expect, it } from "vitest";
import { deriveMeritsAndDemerits } from "./productMerits";

const baseInput = {
  warrantyMonths: null,
  mrpMinor: null,
  unitPriceMinor: 20_000n,
  priceAgeDays: 5,
  verifiedAt: null,
  availability: "UNKNOWN" as const,
  alternativesConsidered: 1,
};

describe("deriveMeritsAndDemerits", () => {
  it("lists a verified date as a merit when the listing has been verified", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      verifiedAt: new Date("2026-08-15T00:00:00Z"),
    });
    expect(result.merits).toContain("Verified by Niwasthan on 2026-08-15");
    expect(result.demerits).not.toContain("Not yet verified by Niwasthan");
  });

  it("lists 'not yet verified' as a demerit when never verified", () => {
    const result = deriveMeritsAndDemerits(baseInput);
    expect(result.demerits).toContain("Not yet verified by Niwasthan");
  });

  it("lists a real warranty period as a merit", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      warrantyMonths: 24,
    });
    expect(result.merits).toContain("Covered by a 24-month warranty");
  });

  it("lists 'no manufacturer warranty' as a demerit only when explicitly zero, never confused with unknown", () => {
    const zeroWarranty = deriveMeritsAndDemerits({
      ...baseInput,
      warrantyMonths: 0,
    });
    const unknownWarranty = deriveMeritsAndDemerits({
      ...baseInput,
      warrantyMonths: null,
    });
    expect(zeroWarranty.demerits).toContain(
      "No manufacturer warranty on record",
    );
    expect(unknownWarranty.demerits).toContain(
      "Warranty coverage not yet confirmed",
    );
    expect(unknownWarranty.demerits).not.toContain(
      "No manufacturer warranty on record",
    );
  });

  it("computes the exact real discount amount as a merit when a genuine MRP gap exists", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      mrpMinor: 24_000n,
      unitPriceMinor: 20_000n,
    });
    expect(result.merits).toContain("Currently discounted ₹40 below MRP");
  });

  it("never claims a discount when MRP equals or is below the selling price", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      mrpMinor: 20_000n,
      unitPriceMinor: 20_000n,
    });
    expect(result.merits.some((m) => m.includes("discounted"))).toBe(false);
  });

  it("reflects real stock availability correctly in both directions", () => {
    const inStock = deriveMeritsAndDemerits({
      ...baseInput,
      availability: "IN_STOCK",
    });
    const outOfStock = deriveMeritsAndDemerits({
      ...baseInput,
      availability: "OUT_OF_STOCK",
    });
    expect(inStock.merits).toContain("In stock");
    expect(outOfStock.demerits).toContain("Currently out of stock");
  });

  it("never claims a stock merit or demerit when availability is genuinely unknown", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      availability: "UNKNOWN",
    });
    expect(result.merits).not.toContain("In stock");
    expect(result.demerits).not.toContain("Currently out of stock");
    expect(result.demerits).not.toContain("Limited stock remaining");
  });

  it("flags a single-option category as a real demerit, matching the quality gate's adequate-options threshold", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      alternativesConsidered: 1,
    });
    expect(result.demerits).toContain(
      "Only option currently available in this category",
    );
  });

  it("lists genuine comparison as a merit once the adequate-options threshold is met", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      alternativesConsidered: 4,
    });
    expect(result.merits).toContain(
      "Compared against 3 other real options in this category",
    );
  });

  it("flags a stale price as a real demerit past the threshold", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      priceAgeDays: 45,
    });
    expect(result.demerits).toContain("Price last confirmed 45 days ago");
  });

  it("does not flag a recently-checked price as stale", () => {
    const result = deriveMeritsAndDemerits({
      ...baseInput,
      priceAgeDays: 5,
    });
    expect(result.demerits.some((d) => d.includes("last confirmed"))).toBe(
      false,
    );
  });
});
