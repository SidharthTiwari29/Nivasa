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
  })
  .refine(
    (input) => Boolean(input.designVersionId) !== Boolean(input.jobId),
    "Exactly one asset parent is required",
  );

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const assetIdParamSchema = z.object({
  id: z.string().cuid(),
});
