export type SmartHomeCategory =
  | "LIGHTING"
  | "SWITCHES"
  | "SENSORS"
  | "SECURITY"
  | "LOCKS"
  | "CLIMATE"
  | "ENERGY";

export type SmartHomeNeed = {
  id: string;
  category: SmartHomeCategory;
  name: string;
  compatibility: string[];
  installation: string[];
  priority: "MUST_HAVE" | "SHOULD_HAVE" | "NICE_TO_HAVE";
};

export type SmartHomeContext = {
  propertyType?: string;
  rooms: Array<{ id: string; name: string; type: string; areaSqFt?: number }>;
  lifestyle?: string[];
  existingSystems?: string[];
  budgetMinor?: bigint;
};

export type SmartHomeRecommendation = SmartHomeNeed & {
  rationale: string;
  confidenceBps: number;
  evidenceRequired: boolean;
};

const CATEGORY_ORDER: SmartHomeCategory[] = [
  "LIGHTING",
  "SWITCHES",
  "SENSORS",
  "SECURITY",
  "LOCKS",
  "CLIMATE",
  "ENERGY",
];

export function recommendSmartHome(context: SmartHomeContext): SmartHomeRecommendation[] {
  const recommendations: SmartHomeRecommendation[] = [];
  const hasBedroom = context.rooms.some((room) => room.type === "BEDROOM");
  const hasLiving = context.rooms.some((room) => room.type === "LIVING_ROOM");

  if (context.rooms.length > 0) {
    recommendations.push({
      id: "smart-lighting",
      category: "LIGHTING",
      name: "Room-aware smart lighting",
      compatibility: ["standard Indian electrical circuits"],
      installation: ["neutral-wire requirement must be verified per switch point"],
      priority: "SHOULD_HAVE",
      rationale: "Lighting automation should be planned against the actual room inventory.",
      confidenceBps: 8500,
      evidenceRequired: true,
    });
  }
  if (hasLiving || hasBedroom) {
    recommendations.push({
      id: "occupancy-sensing",
      category: "SENSORS",
      name: "Occupancy / presence sensing",
      compatibility: ["selected lighting and automation ecosystems"],
      installation: ["sensor placement and power must be validated"],
      priority: "NICE_TO_HAVE",
      rationale: "Presence sensing can reduce manual switching and improve automation quality.",
      confidenceBps: 7800,
      evidenceRequired: true,
    });
  }
  recommendations.push({
    id: "smart-security",
    category: "SECURITY",
    name: "Connected home security layer",
    compatibility: ["property-specific network and device ecosystem"],
    installation: ["network coverage and mounting points must be verified"],
    priority: "SHOULD_HAVE",
    rationale: "Security should be considered as part of the home system rather than as isolated gadgets.",
    confidenceBps: 8200,
    evidenceRequired: true,
  });

  return recommendations.sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
}
