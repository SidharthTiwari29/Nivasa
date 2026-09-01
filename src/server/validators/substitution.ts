import { z } from "zod";

const impactEnum = z.enum(["IMPROVED", "SAME", "REDUCED", "UNKNOWN"]);

export const createSubstitutionSchema = z.object({
  fromCatalogueItemId: z.string().cuid(),
  toCatalogueItemId: z.string().cuid(),
  qualityImpact: impactEnum.default("UNKNOWN"),
  maintenanceImpact: impactEnum.default("UNKNOWN"),
  appearanceImpact: impactEnum.default("UNKNOWN"),
  durabilityImpact: impactEnum.default("UNKNOWN"),
  explanation: z.string().trim().min(1).max(2000),
});
export type CreateSubstitutionInput = z.infer<typeof createSubstitutionSchema>;

export const catalogueItemIdParamSchema = z.object({
  catalogueItemId: z.string().cuid(),
});
