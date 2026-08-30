import { z } from "zod";

const signedMinorMoney = z
  .number()
  .int()
  .min(Number.MIN_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER);

const substitutionCandidateSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(300),
  priceMinor: z.number().int().nonnegative().nullable(),
  qualityImpact: z.enum(["BETTER", "SIMILAR", "LOWER", "UNKNOWN"]),
  maintenanceImpact: z.enum(["BETTER", "SIMILAR", "HIGHER", "UNKNOWN"]),
  durabilityImpact: z.enum(["BETTER", "SIMILAR", "LOWER", "UNKNOWN"]),
  appearanceImpact: z.enum(["BETTER", "SIMILAR", "DIFFERENT", "UNKNOWN"]),
  explanation: z.string().trim().min(1).max(1000),
  evidenceIds: z.array(z.string().min(1).max(200)).max(50),
});

const base = z.object({
  baseVersion: z.number().int().positive(),
  currentPriceMinor: z.number().int().nonnegative().nullable(),
  proposedPriceMinor: z.number().int().nonnegative().nullable(),
  roomId: z.string().cuid().nullable().optional(),
  scopeChange: z.enum(["REPLACE", "ADD", "REMOVE", "MODIFY"]),
  reason: z.string().trim().min(1).max(500),
  designImpact: z.enum(["BETTER", "SIMILAR", "LOWER", "UNKNOWN"]),
  functionImpact: z.enum(["BETTER", "SIMILAR", "LOWER", "UNKNOWN"]),
  inputs: z.record(z.string(), z.unknown()),
});

export const whatIfPreviewSchema = base.extend({
  candidates: z.array(substitutionCandidateSchema).max(50).default([]),
});

export const whatIfCommitSchema = base.extend({
  proposedLowDeltaMinor: signedMinorMoney,
  proposedTargetDeltaMinor: signedMinorMoney,
  proposedHighDeltaMinor: signedMinorMoney,
});

export const whatIfSchema = z.discriminatedUnion("action", [
  whatIfPreviewSchema.extend({ action: z.literal("preview") }),
  whatIfCommitSchema.extend({ action: z.literal("commit") }),
]);

export type WhatIfPreviewInput = z.infer<typeof whatIfPreviewSchema>;
export type WhatIfCommitInput = z.infer<typeof whatIfCommitSchema>;
export type WhatIfInput = z.infer<typeof whatIfSchema>;
