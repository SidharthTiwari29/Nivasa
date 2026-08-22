import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional(),
});
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().max(500).nullable().optional(),
});
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const propertyIdParamSchema = z.object({
  id: z.string().cuid(),
});
