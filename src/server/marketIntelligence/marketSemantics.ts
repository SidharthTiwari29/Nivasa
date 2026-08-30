export type MarketPriceType =
  | "OBSERVED_SELLING"
  | "LIST_MRP"
  | "DEALER_QUOTE"
  | "INDICATIVE"
  | "LABOUR"
  | "INSTALLATION"
  | "LOGISTICS";

export type NormalizedUnit =
  | "unit"
  | "piece"
  | "set"
  | "box"
  | "pack"
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "sqft"
  | "sqm"
  | "m"
  | "cm";

const UNIT_ALIASES: Record<string, NormalizedUnit> = {
  unit: "unit",
  units: "unit",
  piece: "piece",
  pieces: "piece",
  pc: "piece",
  pcs: "piece",
  set: "set",
  sets: "set",
  box: "box",
  boxes: "box",
  pack: "pack",
  packs: "pack",
  package: "pack",
  packages: "pack",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  g: "g",
  gram: "g",
  grams: "g",
  l: "l",
  litre: "l",
  liter: "l",
  litres: "l",
  liters: "l",
  ml: "ml",
  sqft: "sqft",
  "sq ft": "sqft",
  "sq.ft": "sqft",
  "sq. ft": "sqft",
  "square foot": "sqft",
  "square feet": "sqft",
  sqm: "sqm",
  "sq m": "sqm",
  "square metre": "sqm",
  "square meter": "sqm",
  m: "m",
  metre: "m",
  meter: "m",
  metres: "m",
  meters: "m",
  cm: "cm",
  centimetre: "cm",
  centimeter: "cm",
  centimetres: "cm",
  centimeters: "cm",
};

export const normalizeUnit = (value: string): NormalizedUnit => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  const unit = UNIT_ALIASES[normalized];
  if (!unit) throw new Error(`Unsupported market unit: ${value}`);
  return unit;
};

const SCALE_TO_BASE: Record<NormalizedUnit, number> = {
  unit: 1,
  piece: 1,
  set: 1,
  box: 1,
  pack: 1,
  kg: 1,
  g: 0.001,
  l: 1,
  ml: 0.001,
  sqft: 1,
  sqm: 10.763910416709722,
  m: 1,
  cm: 0.01,
};

export const normalizeQuantity = (
  quantity: number,
  from: string,
  to: NormalizedUnit,
): number => {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error("Market quantity must be a finite non-negative number");
  }
  const source = normalizeUnit(from);
  if (source === to) return quantity;
  const group = (unit: NormalizedUnit) => {
    if (["unit", "piece", "set", "box", "pack"].includes(unit)) return "count";
    if (["kg", "g"].includes(unit)) return "mass";
    if (["l", "ml"].includes(unit)) return "volume";
    if (["sqft", "sqm"].includes(unit)) return "area";
    return "length";
  };
  if (group(source) !== group(to)) {
    throw new Error(`Incompatible market units: ${source} -> ${to}`);
  }
  return (quantity * SCALE_TO_BASE[source]) / SCALE_TO_BASE[to];
};

export interface PriceSemantics {
  priceType: MarketPriceType;
  amountMinor: bigint;
  currency: "INR";
  unit: NormalizedUnit;
  taxIncluded: boolean | null;
  shippingIncluded: boolean | null;
  installationIncluded: boolean | null;
  geography: string | null;
  observedAt: Date;
  freshUntil: Date | null;
}

export const assertPriceSemantics = (price: PriceSemantics): void => {
  if (price.amountMinor < 0n) throw new Error("Market price cannot be negative");
  if (price.currency !== "INR") {
    throw new Error("Only INR market prices are supported");
  }
  normalizeUnit(price.unit);
  if (price.freshUntil && price.freshUntil < price.observedAt) {
    throw new Error("Market freshness cannot end before observation");
  }
  if (!price.geography && price.priceType === "DEALER_QUOTE") {
    throw new Error("Dealer quotes require an explicit geography");
  }
};

export const isPriceFresh = (
  price: Pick<PriceSemantics, "freshUntil">,
  now = new Date(),
): boolean => price.freshUntil === null || price.freshUntil >= now;

export const classifyPrice = (input: {
  amountMinor: bigint;
  mrpMinor?: bigint;
  sourceKind: "OFFICIAL" | "DEALER" | "MANUAL" | "INFERRED";
  unit: string;
}): PriceSemantics["priceType"] => {
  normalizeUnit(input.unit);
  if (input.sourceKind === "INFERRED") return "INDICATIVE";
  if (input.sourceKind === "DEALER") return "DEALER_QUOTE";
  if (input.mrpMinor !== undefined && input.amountMinor === input.mrpMinor) {
    return "LIST_MRP";
  }
  return "OBSERVED_SELLING";
};
