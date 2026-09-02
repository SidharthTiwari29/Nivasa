import { describe, expect, it } from "vitest";
import { roomUnderstandingSchema } from "./homeIntelligence";

const base = {
  roomType: "BEDROOM" as const,
  name: "Master Bedroom",
  source: "AI" as const,
  confidenceBps: 9000,
  status: "UNCONFIRMED" as const,
};

describe("roomUnderstandingSchema.dimensions", () => {
  it("accepts a well-formed dimensions object", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: {
        lengthFt: 12,
        widthFt: 10,
        areaSqFt: 120,
        doors: [{ widthFt: 3, wall: "NORTH" }],
        windows: [{ widthFt: 4 }],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts dimensions being entirely omitted", () => {
    expect(roomUnderstandingSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a negative room length", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: { lengthFt: -5 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an implausibly large room length (likely a unit-confusion bug)", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: { lengthFt: 999_999 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a door with an invalid wall enum value", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: { doors: [{ widthFt: 3, wall: "NORTHWEST" }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a door missing its required width", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: { doors: [{ wall: "NORTH" }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 doors as implausible for a single room", () => {
    const result = roomUnderstandingSchema.safeParse({
      ...base,
      dimensions: {
        doors: Array.from({ length: 21 }, () => ({ widthFt: 3 })),
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("roomUnderstandingSchema source/confidence cross-validation", () => {
  it("rejects an AI-sourced submission with no confidence score at all", () => {
    const result = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "AI",
      status: "UNCONFIRMED",
      // confidenceBps intentionally omitted
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes("confidenceBps")),
      ).toBe(true);
    }
  });

  it("accepts an AI-sourced submission with a real confidence score", () => {
    const result = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "AI",
      confidenceBps: 8500,
      status: "UNCONFIRMED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a USER-sourced submission that includes a confidence score", () => {
    const result = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "USER",
      confidenceBps: 5000,
      status: "CONFIRMED",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes("confidenceBps")),
      ).toBe(true);
    }
  });

  it("accepts a USER-sourced submission with no confidence score - a stated fact needs none", () => {
    const result = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "USER",
      status: "CONFIRMED",
    });
    expect(result.success).toBe(true);
  });

  it("does not require or forbid a confidence score for IMPORTED source - genuinely ambiguous provenance", () => {
    const withConfidence = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "IMPORTED",
      confidenceBps: 6000,
      status: "NEEDS_REVIEW",
    });
    const withoutConfidence = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      source: "IMPORTED",
      status: "NEEDS_REVIEW",
    });
    expect(withConfidence.success).toBe(true);
    expect(withoutConfidence.success).toBe(true);
  });
});
