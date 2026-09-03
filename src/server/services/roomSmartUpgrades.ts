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
// Every category below was included because a real, commonly-sold
// Indian-market product genuinely exists for that room - not because
// every room "should" have the same generic smart list. An earlier
// version of this mapping incorrectly left BATHROOM empty, treating
// "don't fabricate" as "be minimal" - those are different things. Smart
// geysers with app-controlled temperature, motion-sensor exhaust fans,
// and smart anti-fog mirrors with built-in lighting are real, common
// products - omitting them was an under-count, not appropriate caution.
// The actual discipline that still applies: never invent a claim about
// a SPECIFIC product's rating, capability, or price - being thorough
// about which real product CATEGORIES exist is a different, correct
// kind of completeness.
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
    { category: "smart-plug", quantity: 2 },
    { category: "smart-curtains", quantity: 1 },
    { category: "smart-ac-controller", quantity: 1 },
    { category: "smart-security-camera", quantity: 1 },
  ],
  BEDROOM: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-blinds", quantity: 1 },
    { category: "smart-plug", quantity: 1 },
    { category: "smart-ac-controller", quantity: 1 },
  ],
  KITCHEN: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-chimney-controller", quantity: 1 },
    { category: "smart-plug", quantity: 1 },
    { category: "gas-leak-sensor", quantity: 1 },
  ],
  BATHROOM: [
    { category: "smart-geyser", quantity: 1 },
    { category: "smart-exhaust-fan", quantity: 1 },
    { category: "smart-mirror", quantity: 1 },
  ],
  DINING_ROOM: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-speaker", quantity: 1 },
  ],
  BALCONY: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-irrigation-controller", quantity: 1 },
  ],
  STUDY: [
    { category: "smart-lighting", quantity: 1 },
    { category: "smart-plug", quantity: 1 },
    { category: "air-purifier", quantity: 1 },
  ],
  // OTHER remains genuinely empty - an undefined room type has no
  // real basis for a specific smart-product recommendation, and
  // guessing here would be the actual fabrication this system avoids.
  OTHER: [],
};

export function getRoomSmartUpgrades(roomType: RoomType) {
  return ROOM_SMART_UPGRADES[roomType];
}
