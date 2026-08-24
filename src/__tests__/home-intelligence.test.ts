import { describe, expect, it } from "vitest";
import {
  homeDnaSchema,
  homeIntelligenceSchema,
  roomUnderstandingSchema,
} from "@/server/validators/homeIntelligence";

describe("Home Intelligence validation", () => {
  it("accepts a complete confirmed home profile", () => {
    const result = homeIntelligenceSchema.safeParse({
      propertyType: "APARTMENT",
      configuration: "3BHK",
      possessionDate: "2027-03-01",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      carpetAreaSqFt: 1601,
      metadata: { source: "USER" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects impossible room confidence values", () => {
    const result = roomUnderstandingSchema.safeParse({
      roomType: "BEDROOM",
      name: "Master Bedroom",
      confidenceBps: 10001,
      source: "AI",
      status: "UNCONFIRMED",
    });

    expect(result.success).toBe(false);
  });

  it("requires structured Home DNA domains", () => {
    const result = homeDnaSchema.safeParse({
      household: {},
      lifestyle: {},
      designPersonality: {},
      storageNeeds: {},
      functionalNeeds: {},
      futureNeeds: {},
      smartHomePreferences: {},
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.language).toBe("en-IN");
  });
});
