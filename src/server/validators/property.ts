import { z } from 'zod';

export const propertyCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.record(z.string(), z.unknown()).optional(),
});

export const floorPlanUploadSchema = z.object({
  propertyId: z.string().min(1),
  storageKey: z.string().min(1).max(512),
  contentType: z.enum(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']),
});
