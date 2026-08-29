import { describe, expect, it } from "vitest";
import { budgetLineSchema, createBudgetSchema } from "./budget";

describe("budget validators", () => {
  it("accepts a catalogue line with its catalogue item", () => {
    const result = budgetLineSchema.safeParse({
      kind: "CATALOGUE",
      catalogueItemId: "ckatalogueitem123456789012345",
      category: "Sofa",
      lowMinor: 100000,
      targetMinor: 150000,
      highMinor: 200000,
      truth: "ESTIMATE",
      basis: { source: "catalogue" },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a custom line without a catalogue item", () => {
    const result = budgetLineSchema.safeParse({
      kind: "CUSTOM",
      category: "Civil work",
      lowMinor: 100000,
      targetMinor: 150000,
      highMinor: 200000,
      truth: "RECOMMENDATION",
      basis: { source: "estimate" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a custom line that supplies a catalogue item", () => {
    const result = budgetLineSchema.safeParse({
      kind: "CUSTOM",
      catalogueItemId: "ckatalogueitem123456789012345",
      category: "Civil work",
      lowMinor: 100000,
      targetMinor: 150000,
      highMinor: 200000,
      truth: "ESTIMATE",
      basis: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid budget range", () => {
    const result = budgetLineSchema.safeParse({
      kind: "CUSTOM",
      category: "Furniture",
      lowMinor: 200000,
      targetMinor: 150000,
      highMinor: 250000,
      truth: "ESTIMATE",
      basis: {},
    });

    expect(result.success).toBe(false);
  });

  it("requires at least one budget line", () => {
    const result = createBudgetSchema.safeParse({
      idempotencyKey: "idempotency-key-123",
      contingencyMinor: 0,
      truth: "ESTIMATE",
      scope: {},
      assumptions: {},
      sourceReferences: [],
      lines: [],
    });

    expect(result.success).toBe(false);
  });
});
