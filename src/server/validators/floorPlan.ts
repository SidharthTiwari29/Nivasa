import { z } from "zod";

export const createFloorPlanSchema = z.object({
  propertyId: z.string().cuid(),
  assetId: z.string().cuid(),
});
export type CreateFloorPlanInput = z.infer<typeof createFloorPlanSchema>;

export const floorPlanIdParamSchema = z.object({
  id: z.string().cuid(),
});
