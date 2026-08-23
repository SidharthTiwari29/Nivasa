import { z } from "zod";

export const propertyIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const homeIntelligenceSchema = z.object({
  propertyType: z.enum(["APARTMENT", "VILLA", "INDEPENDENT_HOUSE", "OTHER"]),
  configuration: z.string().trim().min(1).max(100).optional(),
  possessionDate: z.coerce.date().nullable().optional(),
  city: z.string().trim().min(1).max(120).optional(),
  state: z.string().trim().min(1).max(120).optional(),
  country: z.string().trim().min(1).max(120).default("India"),
  carpetAreaSqFt: z.number().positive().max(100000).nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type HomeIntelligenceInput = z.infer<typeof homeIntelligenceSchema>;

export const roomUnderstandingParamSchema = z.object({
  propertyId: z.string().cuid(),
  roomId: z.string().cuid(),
});

export const roomUnderstandingSchema = z.object({
  roomType: z.enum([
    "LIVING_ROOM",
    "BEDROOM",
    "KITCHEN",
    "BATHROOM",
    "DINING_ROOM",
    "BALCONY",
    "STUDY",
    "OTHER",
  ]),
  name: z.string().trim().min(1).max(120),
  confidenceBps: z.number().int().min(0).max(10000).nullable().optional(),
  source: z.enum(["AI", "USER", "IMPORTED"]),
  geometry: z.record(z.string(), z.any()).optional(),
  dimensions: z.record(z.string(), z.any()).optional(),
  constraints: z.record(z.string(), z.any()).optional(),
  requirements: z.record(z.string(), z.any()).optional(),
  status: z.enum(["UNCONFIRMED", "CONFIRMED", "CORRECTED", "NEEDS_REVIEW"]),
});
export type RoomUnderstandingInput = z.infer<typeof roomUnderstandingSchema>;

export const homeDnaSchema = z.object({
  household: z.record(z.string(), z.any()),
  lifestyle: z.record(z.string(), z.any()),
  designPersonality: z.record(z.string(), z.any()),
  storageNeeds: z.record(z.string(), z.any()),
  functionalNeeds: z.record(z.string(), z.any()),
  futureNeeds: z.record(z.string(), z.any()),
  smartHomePreferences: z.record(z.string(), z.any()),
  language: z.string().trim().min(2).max(20).default("en-IN"),
});
export type HomeDnaInput = z.infer<typeof homeDnaSchema>;
