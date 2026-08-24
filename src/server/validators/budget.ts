import { z } from "zod";

const minorMoney = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const signedMinorMoney = z
  .number()
  .int()
  .min(Number.MIN_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER);

export const budgetLineSchema = z
  .object({
    roomId: z.string().cuid().nullable().optional(),
    category: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    lowMinor: minorMoney,
    targetMinor: minorMoney,
    highMinor: minorMoney,
    truth: z.enum(["ESTIMATE", "VERIFIED", "RECOMMENDATION"]),
    basis: z.record(z.string(), z.unknown()),
  })
  .refine((value) => value.lowMinor <= value.targetMinor, {
    message: "lowMinor must be less than or equal to targetMinor",
    path: ["targetMinor"],
  })
  .refine((value) => value.targetMinor <= value.highMinor, {
    message: "targetMinor must be less than or equal to highMinor",
    path: ["highMinor"],
  });

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
