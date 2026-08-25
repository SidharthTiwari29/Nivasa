export type InteriorEntityType =
  | "PRODUCT"
  | "MATERIAL"
  | "COMPONENT"
  | "ASSEMBLY"
  | "SERVICE"
  | "BRAND"
  | "MANUFACTURER"
  | "SELLER"
  | "DESIGN_ELEMENT";

export type InteriorRelationType =
  | "ALTERNATIVE_TO"
  | "COMPATIBLE_WITH"
  | "PART_OF"
  | "USES_MATERIAL"
  | "SOLD_BY"
  | "MANUFACTURED_BY"
  | "BRANDED_AS"
  | "SUITABLE_FOR"
  | "REQUIRES_SERVICE";

export interface InteriorEntity {
  id: string;
  type: InteriorEntityType;
  canonicalKey: string;
  name: string;
  normalizedName: string;
  description?: string;
  attributes: Record<string, string | number | boolean>;
  sourceObservationIds: string[];
}

export interface InteriorEntityRelation {
  fromEntityId: string;
  toEntityId: string;
  type: InteriorRelationType;
  confidenceBps: number;
  evidenceIds: string[];
}

export interface EvidenceRef {
  id: string;
  sourceKey: string;
  sourceUrl: string;
  observedAt: Date;
  verifiedAt?: Date;
  confidenceBps: number;
  excerpt?: string;
}

export interface MarketObservation {
  id: string;
  entityId: string;
  sourceKey: string;
  externalId: string;
  sourceUrl: string;
  observedAt: Date;
  geography?: string;
  currency: "INR";
  priceMinor?: bigint;
  mrpMinor?: bigint;
  available?: boolean;
  sellerId?: string;
  evidenceIds: string[];
}

export const buildInteriorCanonicalKey = (
  type: InteriorEntityType,
  brand: string | undefined,
  name: string,
  variant?: string,
): string => {
  const normalize = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ");

  return [
    type,
    normalize(brand ?? "unknown-brand"),
    normalize(name),
    normalize(variant ?? "default"),
  ].join("|");
};

export const isEvidenceSufficient = (
  evidence: readonly EvidenceRef[],
  minimumConfidenceBps = 7000,
): boolean =>
  evidence.length > 0 &&
  evidence.some((item) => item.confidenceBps >= minimumConfidenceBps);
