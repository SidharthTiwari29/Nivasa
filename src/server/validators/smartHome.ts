import { z } from "zod";

const capabilityIds = [
  "SMART_SWITCHES",
  "SMART_LIGHTING",
  "SCENE_AUTOMATION",
  "SMART_CURTAINS",
  "SMART_LOCK",
  "AC_CONTROL",
  "OCCUPANCY_SENSORS",
  "MUSIC_SCENES",
  "ENTRY_SCENE",
  "MOVIE_MODE",
  "NIGHT_MODE",
  "ELDERLY_SAFETY",
  "KIDS_SAFETY",
] as const;

const visualizationStates = ["NOT_CONFIGURED", "PREVIEW", "ACTIVE"] as const;

export const smartHomeCapabilitySchema = z.object({
  id: z.enum(capabilityIds),
  enabled: z.boolean(),
  roomIds: z.array(z.string().cuid()).max(50).default([]),
  mode: z.string().trim().min(1).max(100).optional(),
  configuration: z.record(z.string(), z.unknown()).default({}),
});

export const smartHomeScenarioSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  trigger: z.string().trim().min(1).max(300),
  capabilityIds: z.array(z.enum(capabilityIds)).min(1).max(20),
  enabled: z.boolean().default(true),
});

export const smartHomePlanSchema = z.object({
  capabilities: z.array(smartHomeCapabilitySchema).max(50),
  scenarios: z.array(smartHomeScenarioSchema).max(50).default([]),
  visualizationState: z.enum(visualizationStates).default("PREVIEW"),
  budgetMinor: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .nullable()
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const smartHomePatchSchema = z.object({
  capabilities: z.array(smartHomeCapabilitySchema).max(50).optional(),
  scenarios: z.array(smartHomeScenarioSchema).max(50).optional(),
  visualizationState: z.enum(visualizationStates).optional(),
  budgetMinor: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .nullable()
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const smartHomeParamSchema = z.object({
  id: z.string().cuid(),
});

export type SmartHomePlanInput = z.infer<typeof smartHomePlanSchema>;
export type SmartHomePatchInput = z.infer<typeof smartHomePatchSchema>;
