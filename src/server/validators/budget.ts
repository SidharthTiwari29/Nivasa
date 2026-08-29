import { z } from "zod";

const minorMoney = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const signedMinorMoney = z
  .number()
  .int()
  .min(Number.MIN_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER);

const budgetLineBaseSchema = z.object({
  roomId: z.string().cuid().nullable().optional(),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  lowMinor: minorMoney,
  targetMinor: minorMoney,
  highMinor: minorMoney,
  truth: z.enum(["ESTIMATE", "VERIFIED", "RECOMMENDATION"]),
  basis: z.record(z.string(), z.unknown()),
});

const budgetLineRangeRefinement = (
  value: z.infer<typeof budgetLineBaseSchema>,
  ctx: z.RefinementCtx,
) => {
  if (value.lowMinor > value.targetMinor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lowMinor must be less than or equal to targetMinor",
      path: ["targetMinor"],
    });
  }

  if (value.targetMinor > value.highMinor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "targetMinor must be less than or equal to highMinor",
      path: ["highMinor"],
    });
  }
};

const catalogueBudgetLineSchema = budgetLineBaseSchema.extend({
  kind: z.literal("CATALOGUE"),
  catalogueItemId: z.string().cuid(),
});

const customBudgetLineSchema = budgetLineBaseSchema.extend({
  kind: z.literal("CUSTOM"),
  catalogueItemId: z.never().optional(),
});

export const budgetLineSchema = z
  .discriminatedUnion("kind", [
    catalogueBudgetLineSchema,
    customBudgetLineSchema,
  ])
  .superRefine(budgetLineRangeRefinement);

export const createBudgetSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(128),
  homeIntelligenceVersion: z.number().int().positive().nullable().optional(),
  homeDnaVersion: z.number().int().positive().nullable().optional(),
  contingencyMinor: minorMoney.default(0),
  truth: z.enum(["ESTIMATE", "VERIFIED", "RECOMMENDATION"]),
  scope: z.record(z.string(), z.unknown()),
  assumptions: z.record(z.string(), z.unknown()),
  sourceReferences: z.array(z.string().url()).max(20).default([]),
  lines: z.array(budgetLineSchema).min(1).max(100),
});
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const budgetImpactSchema = z.object({
  baseVersion: z.number().int().positive(),
  proposedLowDeltaMinor: signedMinorMoney,
  proposedTargetDeltaMinor: signedMinorMoney,
  proposedHighDeltaMinor: signedMinorMoney,
  reason: z.string().trim().min(1).max(500),
  inputs: z.record(z.string(), z.unknown()),
});
export type BudgetImpactInput = z.infer<typeof budgetImpactSchema>;

export const lockBudgetSchema = z.object({
  version: z.number().int().positive(),
});
export type LockBudgetInput = z.infer<typeof lockBudgetSchema>;
