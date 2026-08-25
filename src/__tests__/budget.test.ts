import { describe, expect, it } from "vitest";
import { createBudgetSchema } from "@/server/validators/budget";

describe("Budget Reality validation", () => {
  const base = {
    idempotencyKey: "budget-test-001",
    truth: "ESTIMATE" as const,
    scope: { configuration: "3BHK" },
    assumptions: { pricing: "planning estimate" },
    lines: [
      {
        kind: "CUSTOM" as const,
        category: "kitchen",
        lowMinor: 200000,
        targetMinor: 250000,
        highMinor: 300000,
        truth: "ESTIMATE" as const,
        basis: { method: "source-backed planning range" },
      },
    ],
  };

  it("accepts a labelled planning estimate", () => {
    expect(createBudgetSchema.parse(base).truth).toBe("ESTIMATE");
  });

  it("rejects an inverted monetary band", () => {
    expect(() =>
      createBudgetSchema.parse({
        ...base,
        lines: [{ ...base.lines[0], lowMinor: 300000, targetMinor: 200000 }],
      }),
    ).toThrow();
  });

  it("rejects unsafe integer money values", () => {
    expect(() =>
      createBudgetSchema.parse({
        ...base,
        lines: [{ ...base.lines[0], targetMinor: Number.MAX_SAFE_INTEGER + 1 }],
      }),
    ).toThrow();
  });
});
