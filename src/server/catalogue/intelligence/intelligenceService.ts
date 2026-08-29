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

/**
 * Pure application logic; persistence/adapters can be layered on later.
 *
 * The score is deliberately multi-signal: price alone must not be able to
 * turn weak evidence into a "best" recommendation. Availability also has a
 * meaningful floor so an unavailable option cannot win merely by being cheap.
 */
export function rankMarketOptions(
  currentPriceMinor: bigint,
  observations: readonly MarketObservation[],
): RankedOption[] {
  if (currentPriceMinor < 0n)
    throw new Error("current price cannot be negative");

  return observations
    .map((observation) => {
      validateConfidenceBps(observation.confidenceBps);
      const savingMinor = calculatePotentialSavingMinor(
        currentPriceMinor,
        observation.amountMinor,
      );
      const savingBps =
        currentPriceMinor === 0n
          ? 0
          : Number((savingMinor * 10_000n) / currentPriceMinor);
      const availabilityBps = observation.available ? 10_000 : 0;

      // Weighted BEST-VALUE score. The weights intentionally prevent a large
      // price discount from overwhelming evidence confidence or availability.
      const score = Math.round(
        (savingBps * 35 +
          observation.confidenceBps * 30 +
          availabilityBps * 25) /
          100,
      );

      return { observation, savingMinor, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(a.observation.amountMinor - b.observation.amountMinor) ||
        a.observation.observationId.localeCompare(b.observation.observationId),
    );
}

export function assertCanonicalProductMatch(
  product: CanonicalProduct,
  observation: MarketObservation,
): void {
  if (product.id !== observation.canonicalProductId) {
    throw new Error("market observation does not belong to canonical product");
  }
}
