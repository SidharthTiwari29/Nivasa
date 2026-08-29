export type TruthClass = "VERIFIED" | "ESTIMATED" | "INFERRED" | "UNKNOWN";

export type SourceKind =
  | "MANUFACTURER"
  | "BRAND"
  | "RETAILER"
  | "MARKETPLACE"
  | "DEALER"
  | "DISTRIBUTOR"
  | "LOCAL_SUPPLIER"
  | "SERVICE_PROVIDER";

export interface SourceRef {
  sourceId: string;
  kind: SourceKind;
  name: string;
  reference?: string;
}

export interface EvidenceRef {
  evidenceId: string;
  source: SourceRef;
  observedAt: Date;
  verifiedAt?: Date;
  uri?: string;
  excerpt?: string;
}

export interface MarketObservation {
  observationId: string;
  canonicalProductId: string;
  variantId?: string;
  source: SourceRef;
  evidence: EvidenceRef;
  amountMinor: bigint;
  currency: string;
  available: boolean;
  geography?: string;
  confidenceBps: number;
  truth: TruthClass;
}

export interface CanonicalProduct {
  id: string;
  name: string;
  category: string;
  brand?: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  canonicalProductId: string;
  sku?: string;
  attributes: Record<string, string>;
}

export function validateConfidenceBps(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error("confidenceBps must be an integer between 0 and 10000");
  }
}

export function calculatePotentialSavingMinor(
  currentMinor: bigint,
  alternativeMinor: bigint,
): bigint {
  if (currentMinor < 0n || alternativeMinor < 0n) {
    throw new Error("prices cannot be negative");
  }

  return currentMinor > alternativeMinor ? currentMinor - alternativeMinor : 0n;
}
