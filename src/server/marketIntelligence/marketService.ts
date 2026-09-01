import { marketRepository } from "./marketRepository";
import { rankValueCandidates } from "./valueEngine";
import { rankSubstitutions } from "./substitution";

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

// Connects the previously-unused rankValueCandidates/rankSubstitutions pure
// functions to real MarketProduct/MarketSourceProduct/MarketPriceObservation/
// MarketProductRelationship data - before this, those functions were only
// ever exercised against hand-built test fixtures, with no path from an
// actual product to a ranked result.
export const marketRankingService = {
  async moreAndBetterOptions(category: string) {
    const candidates =
      await marketRepository.listActiveCandidatesByCategory(category);
    const priced = candidates.filter(
      (c) => c.amountMinor !== null && c.confidenceBps !== null,
    );
    return rankValueCandidates(
      priced.map((c) => ({
        id: c.sourceProductId,
        priceMinor: c.amountMinor as bigint,
        qualityScoreBps: c.confidenceBps as number,
        compatibilityScoreBps: c.confidenceBps as number,
        durabilityScoreBps: c.confidenceBps as number,
        designFitScoreBps: c.confidenceBps as number,
        evidenceConfidenceBps: c.confidenceBps as number,
        tradeOffs: [],
      })),
    );
  },

  async substitutionsFor(productId: string, currentPriceMinor: bigint | null) {
    const relationships = await marketRepository.listRelationshipsForProduct(
      productId,
      "ALTERNATIVE_TO",
    );
    return rankSubstitutions(
      currentPriceMinor,
      relationships.map((r) => ({
        id: r.toProductId,
        name: r.title,
        priceMinor: null,
        qualityImpact: "UNKNOWN" as const,
        maintenanceImpact: "UNKNOWN" as const,
        durabilityImpact: "UNKNOWN" as const,
        appearanceImpact: "UNKNOWN" as const,
        explanation: `Alternative in category ${r.category}`,
        evidenceIds: r.confidenceBps ? [r.id] : [],
      })),
    );
  },
};
