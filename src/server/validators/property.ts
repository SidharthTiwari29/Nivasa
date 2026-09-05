import { z } from "zod";

const PROPERTY_TYPES = [
  "ONE_BHK",
  "TWO_BHK",
  "THREE_BHK",
  "FOUR_BHK",
  "VILLA",
  "OTHER",
] as const;

export const createPropertySchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  // Stated in whole rupees from the UI (a slider is easier to reason
  // about in rupees than paise) and converted to minor units here, at
  // the one real boundary between user input and storage - matching
  // how every other monetary value in this system is persisted.
  targetBudget: z.number().int().positive().max(100_000_000).optional(),
});
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().max(500).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  propertyType: z.enum(PROPERTY_TYPES).nullable().optional(),
  targetBudget: z
    .number()
    .int()
    .positive()
    .max(100_000_000)
    .nullable()
    .optional(),
});
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const propertyIdParamSchema = z.object({
  id: z.string().cuid(),
});
