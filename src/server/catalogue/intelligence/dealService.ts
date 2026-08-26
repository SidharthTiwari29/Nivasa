import type { MarketObservation } from "./source-domain";
import { calculatePotentialSavingMinor, validateConfidenceBps } from "./source-domain";

export interface DealOption {
  observation: MarketObservation;
  savingMinor: bigint;
  savingBps: number;
}

/** Finds economically meaningful alternatives without inventing prices. */
export function findDeals(
  baselineMinor: bigint,
  observations: readonly MarketObservation[],
  minimumSavingBps = 500,
): DealOption[] {
  if (baselineMinor < 0n) throw new Error("baseline price cannot be negative");
  if (!Number.isInteger(minimumSavingBps) || minimumSavingBps < 0 || minimumSavingBps > 10_000) {
    throw new Error("minimumSavingBps must be between 0 and 10000");
  }

  return observations
    .filter((item) => {
      validateConfidenceBps(item.confidenceBps);
      return item.available && item.amountMinor < baselineMinor;
    })
    .map((observation) => {
      const savingMinor = calculatePotentialSavingMinor(baselineMinor, observation.amountMinor);
      const savingBps = baselineMinor === 0n ? 0 : Number((savingMinor * 10_000n) / baselineMinor);
      return { observation, savingMinor, savingBps };
    })
    .filter((deal) => deal.savingBps >= minimumSavingBps)
    .sort((a, b) => b.savingBps - a.savingBps || Number(a.observation.amountMinor - b.observation.amountMinor));
}
