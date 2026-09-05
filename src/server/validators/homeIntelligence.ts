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
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type HomeIntelligenceInput = z.infer<typeof homeIntelligenceSchema>;

export const roomUnderstandingParamSchema = z.object({
  propertyId: z.string().cuid(),
  roomId: z.string().cuid(),
});

export const roomUnderstandingSchema = z
  .object({
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
    geometry: z.record(z.string(), z.unknown()).optional(),
    // Structured, not a bare record: this is the specific field flagged
    // during Phase 1's design-quality-check work as unstructured Json with
    // no guaranteed shape - checkRoomAreaAdequacy and related checks had to
    // avoid reading from it for exactly that reason. Giving it a real schema
    // means "the data doesn't have the shape code assumes" becomes a caught
    // validation error at write time, not a silent wrong answer or a crash
    // deep in some future feature that assumes a key exists.
    dimensions: z
      .object({
        lengthFt: z.number().positive().max(500).optional(),
        widthFt: z.number().positive().max(500).optional(),
        heightFt: z.number().positive().max(50).optional(),
        areaSqFt: z.number().positive().max(50_000).optional(),
        doors: z
          .array(
            z.object({
              widthFt: z.number().positive().max(20),
              wall: z.enum(["NORTH", "SOUTH", "EAST", "WEST"]).optional(),
              // Real room adjacency, captured at the one place a floor
              // plan naturally records it: every interior door connects
              // exactly two spaces. Optional and additive - existing
              // recorded doors with no connection are unaffected, and
              // this is the real fact this field exists to capture,
              // not an inferred or assumed relationship.
              connectsToRoomId: z.string().cuid().optional(),
            }),
          )
          .max(20)
          .optional(),
        windows: z
          .array(
            z.object({
              widthFt: z.number().positive().max(20),
              wall: z.enum(["NORTH", "SOUTH", "EAST", "WEST"]).optional(),
            }),
          )
          .max(20)
          .optional(),
      })
      .optional(),
    constraints: z.record(z.string(), z.unknown()).optional(),
    requirements: z.record(z.string(), z.unknown()).optional(),
    status: z.enum(["UNCONFIRMED", "CONFIRMED", "CORRECTED", "NEEDS_REVIEW"]),
  })
  .superRefine((data, ctx) => {
    // README/architecture's own "no fabricated certainty" principle,
    // enforced as a real cross-field validation rather than left to
    // per-caller discipline. Two distinct failure modes this closes:
    //
    // 1. An AI-sourced submission with NO confidence score at all is
    //    exactly the fabricated-certainty pattern the whole system is
    //    built to prevent - an inference presented with no stated
    //    uncertainty is indistinguishable from a claimed fact.
    if (data.source === "AI" && data.confidenceBps == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confidenceBps"],
        message:
          "confidenceBps is required when source is AI - an inference must carry a stated confidence, never be presented as certain",
      });
    }
    // 2. A USER-sourced submission is a stated fact, not a probabilistic
    //    guess - a user directly telling Niwasthan their own room's
    //    dimensions should never be hedged with a confidence percentage,
    //    which would misrepresent their own stated input as an uncertain
    //    inference.
    if (data.source === "USER" && data.confidenceBps != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confidenceBps"],
        message:
          "confidenceBps must not be set when source is USER - a user's own stated input is a fact, not a confidence-scored inference",
      });
    }
    // 3. An AI cannot confirm its own output - CONFIRMED means a human
    //    has reviewed and accepted this data as accurate, which an AI
    //    submission cannot self-declare. Confirmation happens only
    //    through the dedicated confirmRoomUnderstanding action (see
    //    homeIntelligenceService.confirmRoomUnderstanding), never as a
    //    field a caller sets directly alongside AI-sourced data in the
    //    same submission that creates it.
    if (data.source === "AI" && data.status === "CONFIRMED") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["status"],
        message:
          "An AI-sourced submission cannot arrive already CONFIRMED - only a human reviewing it through the dedicated confirm action can set this status",
      });
    }
  });
export type RoomUnderstandingInput = z.infer<typeof roomUnderstandingSchema>;

export const confirmRoomUnderstandingParamSchema = z.object({
  propertyId: z.string().cuid(),
  roomId: z.string().cuid(),
});

export const homeDnaSchema = z.object({
  household: z.record(z.string(), z.unknown()),
  lifestyle: z.record(z.string(), z.unknown()),
  designPersonality: z.record(z.string(), z.unknown()),
  storageNeeds: z.record(z.string(), z.unknown()),
  functionalNeeds: z.record(z.string(), z.unknown()),
  futureNeeds: z.record(z.string(), z.unknown()),
  smartHomePreferences: z.record(z.string(), z.unknown()),
  language: z.string().trim().min(2).max(20).default("en-IN"),
});
export type HomeDnaInput = z.infer<typeof homeDnaSchema>;
