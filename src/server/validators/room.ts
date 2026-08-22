import { z } from "zod";

const roomTypeSchema = z.enum([
  "LIVING_ROOM",
  "BEDROOM",
  "KITCHEN",
  "BATHROOM",
  "DINING_ROOM",
  "BALCONY",
  "STUDY",
  "OTHER",
]);

export const createRoomSchema = z.object({
  propertyId: z.string().cuid(),
  type: roomTypeSchema,
  name: z.string().trim().min(1).max(200),
  areaSqFt: z.number().finite().positive().max(1_000_000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateRoomSchema = z.object({
  type: roomTypeSchema.optional(),
  name: z.string().trim().min(1).max(200).optional(),
  areaSqFt: z.number().finite().positive().max(1_000_000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const roomIdParamSchema = z.object({ id: z.string().cuid() });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
