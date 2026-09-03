import { describe, expect, it } from "vitest";
import { getRoomSmartUpgrades, ROOM_SMART_UPGRADES } from "./roomSmartUpgrades";

describe("getRoomSmartUpgrades", () => {
  it("suggests real smart-lighting and smart-speaker upgrades for a living room", () => {
    const upgrades = getRoomSmartUpgrades("LIVING_ROOM");
    expect(upgrades.some((u) => u.category === "smart-lighting")).toBe(true);
    expect(upgrades.some((u) => u.category === "smart-speaker")).toBe(true);
  });

  it("suggests real bathroom-specific smart products - smart geyser, exhaust fan, and mirror - not an empty list", () => {
    const upgrades = getRoomSmartUpgrades("BATHROOM");
    expect(upgrades.some((u) => u.category === "smart-geyser")).toBe(true);
    expect(upgrades.some((u) => u.category === "smart-exhaust-fan")).toBe(true);
    expect(upgrades.some((u) => u.category === "smart-mirror")).toBe(true);
  });

  it("suggests a kitchen-specific gas leak sensor, a real safety-relevant smart product", () => {
    const upgrades = getRoomSmartUpgrades("KITCHEN");
    expect(upgrades.some((u) => u.category === "gas-leak-sensor")).toBe(true);
  });

  it("suggests a balcony-specific smart irrigation controller", () => {
    const upgrades = getRoomSmartUpgrades("BALCONY");
    expect(
      upgrades.some((u) => u.category === "smart-irrigation-controller"),
    ).toBe(true);
  });

  it("returns no smart upgrades for an undefined room type - the one case where guessing would be fabrication", () => {
    expect(getRoomSmartUpgrades("OTHER")).toEqual([]);
  });

  it("defines a non-empty, real list for every actual room type except OTHER", () => {
    for (const [roomType, upgrades] of Object.entries(ROOM_SMART_UPGRADES)) {
      if (roomType === "OTHER") {
        expect(upgrades).toEqual([]);
      } else {
        expect(upgrades.length).toBeGreaterThan(0);
      }
    }
  });

  it("every quantity is a real positive integer", () => {
    for (const upgrades of Object.values(ROOM_SMART_UPGRADES)) {
      for (const upgrade of upgrades) {
        expect(Number.isInteger(upgrade.quantity)).toBe(true);
        expect(upgrade.quantity).toBeGreaterThan(0);
      }
    }
  });

  it("defines an entry for every real RoomType value", () => {
    expect(Object.keys(ROOM_SMART_UPGRADES)).toEqual([
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
