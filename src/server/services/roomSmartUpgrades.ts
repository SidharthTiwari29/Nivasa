import type { RoomType } from "@/server/services/roomCategoryNeeds";

// Niwasthan Magic, correctly scoped: real smart-home PRODUCT
// recommendations (energy-rated lighting, Bluetooth/WiFi-connected
// devices) rather than any environmental-sensing capability this system
// doesn't have. A "presence-triggered playlist" or "adjustable-intensity
// smart lighting" isn't something Niwasthan's own software simulates -
// it's a genuine, manufacturer-built capability of real products
// (smart speakers with presence detection, app-controlled smart bulbs)
// that this recommends, honestly, as real purchasable items.
//
// These are OPTIONAL upgrade categories, deliberately separate from
// ROOM_CATEGORY_NEEDS - a living room's baseline needs (sofa, TV unit)
// don't require a smart bulb to be "complete," so these are additive
// suggestions, not requirements folded into the base curation.
export const ROOM_SMART_UPGRADES: Record<
  RoomType,
  Array<{ category: string; quantity: number }>
> = {
  LIVING_ROOM: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-speaker", quantity: 1 },
  ],
  BEDROOM: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-blinds", quantity: 1 },
  ],
  KITCHEN: [{ category: "smart-lighting", quantity: 1 }],
  BATHROOM: [],
  DINING_ROOM: [{ category: "smart-lighting", quantity: 1 }],
  BALCONY: [{ category: "smart-lighting", quantity: 1 }],
  STUDY: [{ category: "smart-lighting", quantity: 1 }],
  OTHER: [],
};

export function getRoomSmartUpgrades(roomType: RoomType) {
  return ROOM_SMART_UPGRADES[roomType];
}
