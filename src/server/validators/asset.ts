import { z } from "zod";

export const createAssetSchema = z
  .object({
    type: z.enum([
      "FLOOR_PLAN",
      "ROOM_IMAGE",
      "DESIGN_IMAGE",
      "PANORAMA",
      "THREE_D_SCENE",
      "WALKTHROUGH",
      "VIDEO",
      "OTHER",
    ]),
    contentType: z.string().trim().toLowerCase().min(3).max(128),
    sizeBytes: z.number().int().positive().max(524288000).optional(),
    checksum: z.string().trim().max(128).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    designVersionId: z.string().cuid().optional(),
    jobId: z.string().cuid().optional(),
    // A floor plan upload has no design version or AI job yet - it is
    // typically the very first real asset attached to a property,
    // before any design work exists. A direct property-level parent is
    // the real, honest ownership context for exactly that case.
    propertyId: z.string().cuid().optional(),
  })
  .refine(
    (input) =>
      [input.designVersionId, input.jobId, input.propertyId].filter(Boolean)
        .length === 1,
    "Exactly one asset parent is required",
  );

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const assetIdParamSchema = z.object({
  id: z.string().cuid(),
});
