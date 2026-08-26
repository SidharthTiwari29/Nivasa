import {
  calculatePotentialSavingMinor,
  type CanonicalProduct,
  type MarketObservation,
  validateConfidenceBps,
} from "./source-domain";

export interface RankedOption {
  observation: MarketObservation;
  savingMinor: bigint;
  score: number;
}

/** Pure application logic; persistence/adapters can be layered on later. */
export function rankMarketOptions(
  currentPriceMinor: bigint,
  observations: readonly MarketObservation[],
): RankedOption[] {
  if (currentPriceMinor < 0n) throw new Error("current price cannot be negative");

  return observations
    .map((observation) => {
      validateConfidenceBps(observation.confidenceBps);
      const savingMinor = calculatePotentialSavingMinor(
        currentPriceMinor,
        observation.amountMinor,
      );
      const availabilityBonus = observation.available ? 1_000 : 0;
      const savingScore = currentPriceMinor === 0n
        ? 0
        : Number((savingMinor * 10_000n) / currentPriceMinor);
      const score = savingScore + observation.confidenceBps + availabilityBonus;
      return { observation, savingMinor, score };
    })
    .sort((a, b) => b.score - a.score || Number(a.observation.amountMinor - b.observation.amountMinor));
}

export function assertCanonicalProductMatch(
  product: CanonicalProduct,
  observation: MarketObservation,
): void {
  if (product.id !== observation.canonicalProductId) {
    throw new Error("market observation does not belong to canonical product");
  }
}
