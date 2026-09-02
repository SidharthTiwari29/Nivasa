import { describe, expect, it } from "vitest";
import { getRoomCategoryNeeds, ROOM_CATEGORY_NEEDS } from "./roomCategoryNeeds";

describe("getRoomCategoryNeeds", () => {
  it("returns a real, non-empty list of needs for a living room", () => {
    const needs = getRoomCategoryNeeds("LIVING_ROOM");
    expect(needs.length).toBeGreaterThan(0);
    expect(needs.some((n) => n.category === "sofa")).toBe(true);
  });

  it("returns an intentionally empty list for OTHER - never guesses at an undefined room type", () => {
    expect(getRoomCategoryNeeds("OTHER")).toEqual([]);
  });

  it("every quantity is a real positive integer, never zero or fabricated fractional value", () => {
    for (const needs of Object.values(ROOM_CATEGORY_NEEDS)) {
      for (const need of needs) {
        expect(Number.isInteger(need.quantity)).toBe(true);
        expect(need.quantity).toBeGreaterThan(0);
      }
    }
  });

  it("defines needs for every real RoomType enum value, including OTHER", () => {
    const definedTypes = Object.keys(ROOM_CATEGORY_NEEDS);
    expect(definedTypes).toEqual([
      "LIVING_ROOM",
      "BEDROOM",
      "KITCHEN",
      "BATHROOM",
      "DINING_ROOM",
      "BALCONY",
      "STUDY",
      "OTHER",
    ]);
  });
});
