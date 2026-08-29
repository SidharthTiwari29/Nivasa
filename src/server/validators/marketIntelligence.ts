import { z } from "zod";

export const observationIdParamSchema = z.object({
  observationId: z.string().trim().min(1),
});

export const variantIdParamSchema = z.object({
  variantId: z.string().trim().min(1),
});

export const dealQuerySchema = z.object({
  geography: z.string().trim().min(1).optional(),
  minimumSavingBps: z.coerce.number().int().min(0).max(10_000).default(500),
});

export const substitutionQuerySchema = z.object({
  observationId: z.string().trim().min(1),
  geography: z.string().trim().min(1).optional(),
});
