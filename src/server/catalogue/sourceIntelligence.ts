export const SOURCE_KINDS = [
  "MANUFACTURER",
  "BRAND",
  "RETAILER",
  "MARKETPLACE",
  "DEALER",
  "DISTRIBUTOR",
  "LOCAL_SUPPLIER",
  "SERVICE_PROVIDER",
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export const TRUTH_CLASSES = [
  "USER_PROVIDED",
  "SOURCE_VERIFIED",
  "SYSTEM_CALCULATED",
  "AI_INFERRED",
  "UNKNOWN",
] as const;

export type TruthClass = (typeof TRUTH_CLASSES)[number];

export type SourceRef = {
  sourceId: string;
  externalId?: string;
};

export type EvidenceRef = SourceRef & {
  observedAt: Date;
  verifiedAt?: Date;
  reference?: string;
  truthClass: TruthClass;
  confidenceBps?: number;
};

export type ProductIdentity = {
  canonicalProductId: string;
  manufacturer?: string;
  brand?: string;
  model?: string;
  name: string;
};

export type ProductVariantIdentity = {
  canonicalProductId: string;
  variantId: string;
  sku?: string;
  attributes: Record<string, string>;
};

export type MarketObservation = EvidenceRef & {
  canonicalProductId: string;
  variantId?: string;
  sellerName?: string;
  geography?: string;
  currency: string;
  amountMinor?: bigint;
  referenceAmountMinor?: bigint;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
};

export function validateConfidenceBps(confidenceBps: number | undefined): void {
  if (confidenceBps === undefined) return;
  if (!Number.isInteger(confidenceBps) || confidenceBps < 0 || confidenceBps > 10_000) {
    throw new Error("CONFIDENCE_BPS_OUT_OF_RANGE");
  }
}

export function classifyPriceObservation(input: {
  amountMinor?: bigint;
  referenceAmountMinor?: bigint;
  truthClass: TruthClass;
}): "VERIFIED_PRICE" | "CALCULATED_REFERENCE" | "UNKNOWN_PRICE" {
  if (input.amountMinor === undefined) return "UNKNOWN_PRICE";
  if (input.truthClass === "SOURCE_VERIFIED") return "VERIFIED_PRICE";
  if (input.referenceAmountMinor !== undefined) return "CALCULATED_REFERENCE";
  return "UNKNOWN_PRICE";
}

export function potentialSavingMinor(input: {
  currentAmountMinor: bigint;
  alternativeAmountMinor: bigint;
}): bigint {
  const saving = input.currentAmountMinor - input.alternativeAmountMinor;
  return saving > 0n ? saving : 0n;
}
