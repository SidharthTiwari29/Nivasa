import type { MarketObservation, ProductVariant } from "./source-domain";
import { validateConfidenceBps } from "./source-domain";

export type SubstitutionReason = "LOWER_COST" | "UNAVAILABLE" | "BETTER_CONFIDENCE";

export interface SubstitutionOption {
  variant: ProductVariant;
  observation: MarketObservation;
  reasons: SubstitutionReason[];
  score: number;
}

/** Suggests transparent substitutes; it never silently changes the selected product. */
export function rankSubstitutions(
  selectedVariant: ProductVariant,
  selectedObservation: MarketObservation,
  candidates: readonly { variant: ProductVariant; observation: MarketObservation }[],
): SubstitutionOption[] {
  if (selectedObservation.canonicalProductId !== selectedVariant.canonicalProductId) {
    throw new Error("selected observation does not belong to selected variant product");
  }

  return candidates
    .filter(({ variant, observation }) => {
      validateConfidenceBps(observation.confidenceBps);
      return variant.id !== selectedVariant.id &&
        variant.canonicalProductId === selectedVariant.canonicalProductId;
    })
    .map(({ variant, observation }) => {
      const reasons: SubstitutionReason[] = [];
      if (observation.amountMinor < selectedObservation.amountMinor) reasons.push("LOWER_COST");
      if (!selectedObservation.available && observation.available) reasons.push("UNAVAILABLE");
      if (observation.confidenceBps > selectedObservation.confidenceBps) reasons.push("BETTER_CONFIDENCE");
      const score = reasons.length * 10_000 + observation.confidenceBps + (observation.available ? 1_000 : 0);
      return { variant, observation, reasons, score };
    })
    .filter((option) => option.reasons.length > 0)
    .sort((a, b) => b.score - a.score || Number(a.observation.amountMinor - b.observation.amountMinor));
}
