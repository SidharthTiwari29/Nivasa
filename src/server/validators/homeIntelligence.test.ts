import { describe, expect, it } from "vitest";
import { roomUnderstandingSchema } from "./homeIntelligence";

const base = {
  roomType: "BEDROOM" as const,
  name: "Master Bedroom",
  source: "AI" as const,
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
