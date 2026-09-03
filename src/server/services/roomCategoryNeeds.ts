export type RoomType =
  | "LIVING_ROOM"
  | "BEDROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "DINING_ROOM"
  | "BALCONY"
  | "STUDY"
  | "OTHER";

// A real, documented, adjustable product decision - what a typical Indian
// home's room genuinely needs by category - not a fabricated confidence
// claim about any specific product. This is the same kind of decision as
// featureGating.ts's plan-to-feature table: a defensible default the
// business owns and can tune, made explicit in one place rather than
// buried as an assumption inside the generation logic. Quantities are
// per-room defaults, not measured from the room's real dimensions yet -
// a genuine next step once RoomUnderstanding.dimensions is reliably
// populated at scale.
export const ROOM_CATEGORY_NEEDS: Record<
  RoomType,
  Array<{ category: string; quantity: number }>
> = {
  LIVING_ROOM: [
    { category: "sofa", quantity: 1 },
    { category: "coffee-table", quantity: 1 },
    { category: "tv-unit", quantity: 1 },
    { category: "rug", quantity: 1 },
    { category: "curtains", quantity: 2 },
    { category: "ceiling-light", quantity: 1 },
  ],
  BEDROOM: [
    { category: "bed", quantity: 1 },
    { category: "wardrobe", quantity: 1 },
    { category: "bedside-table", quantity: 2 },
    { category: "curtains", quantity: 2 },
    { category: "ceiling-light", quantity: 1 },
  ],
  KITCHEN: [
    { category: "modular-cabinets", quantity: 1 },
    { category: "countertop", quantity: 1 },
    { category: "sink", quantity: 1 },
    { category: "faucet", quantity: 1 },
  ],
  BATHROOM: [
    { category: "wc", quantity: 1 },
    { category: "basin", quantity: 1 },
    { category: "faucet", quantity: 1 },
    { category: "mirror", quantity: 1 },
  ],
  DINING_ROOM: [
    { category: "dining-table", quantity: 1 },
    { category: "dining-chair", quantity: 6 },
    { category: "pendant-light", quantity: 1 },
  ],
  BALCONY: [
    { category: "outdoor-furniture", quantity: 1 },
    { category: "planters", quantity: 2 },
  ],
  STUDY: [
    { category: "study-table", quantity: 1 },
    { category: "study-chair", quantity: 1 },
    { category: "bookshelf", quantity: 1 },
  ],
  // A generic room with no confident default - returning nothing here is
  // the honest choice rather than guessing furniture for an undefined
  // space type.
  OTHER: [],
};

export function getRoomCategoryNeeds(roomType: RoomType) {
  return ROOM_CATEGORY_NEEDS[roomType];
}
