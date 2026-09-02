import { describe, expect, it } from "vitest";
import { getRoomSmartUpgrades, ROOM_SMART_UPGRADES } from "./roomSmartUpgrades";

describe("getRoomSmartUpgrades", () => {
  it("suggests real smart-lighting and smart-speaker upgrades for a living room", () => {
    const upgrades = getRoomSmartUpgrades("LIVING_ROOM");
    expect(upgrades.some((u) => u.category === "smart-lighting")).toBe(true);
    expect(upgrades.some((u) => u.category === "smart-speaker")).toBe(true);
  });

  it("returns no smart upgrades for a bathroom - deliberately honest, not padded to look complete", () => {
    expect(getRoomSmartUpgrades("BATHROOM")).toEqual([]);
  });

  it("returns no smart upgrades for an undefined room type", () => {
    expect(getRoomSmartUpgrades("OTHER")).toEqual([]);
  });

  it("defines an entry (even if empty) for every real RoomType value", () => {
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
