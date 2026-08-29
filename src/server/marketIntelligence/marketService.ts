import { marketRepository } from "./marketRepository";

export interface MarketPricePresentation {
  amountMinor: bigint;
  currency: "INR";
  unit: string;
  priceType: "OBSERVED";
  observedAt: Date;
  freshness: "FRESH" | "STALE" | "UNKNOWN";
  confidenceBps: number | null;
  taxIncluded: boolean | null;
  shippingIncluded: boolean | null;
  installationIncluded: boolean | null;
  location: Record<string, unknown> | null;
  evidence: Record<string, unknown>;
}

function freshness(
  freshUntil: Date | null,
): MarketPricePresentation["freshness"] {
  if (!freshUntil) return "UNKNOWN";
  return freshUntil >= new Date() ? "FRESH" : "STALE";
}

export const marketService = {
  async priceHistory(
    sourceProductId: string,
  ): Promise<MarketPricePresentation[]> {
    const rows = await marketRepository.listPriceHistory(sourceProductId);

    return rows.map((row) => ({
      amountMinor: row.amountMinor as bigint,
      currency: "INR",
      unit: String(row.unit),
      priceType: "OBSERVED",
      observedAt: row.observedAt as Date,
      freshness: freshness((row.freshUntil as Date | null) ?? null),
      confidenceBps:
        typeof row.confidenceBps === "number" ? row.confidenceBps : null,
      taxIncluded:
        typeof row.taxIncluded === "boolean" ? row.taxIncluded : null,
      shippingIncluded:
        typeof row.shippingIncluded === "boolean" ? row.shippingIncluded : null,
      installationIncluded:
        typeof row.installationIncluded === "boolean"
          ? row.installationIncluded
          : null,
      location:
        row.location && typeof row.location === "object"
          ? (row.location as Record<string, unknown>)
          : null,
      evidence:
        row.evidence && typeof row.evidence === "object"
          ? (row.evidence as Record<string, unknown>)
          : {},
    }));
  },
};
