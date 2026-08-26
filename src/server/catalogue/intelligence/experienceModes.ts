export type ExperienceMode =
  | "BEST_VALUE"
  | "LOWEST_COST"
  | "PREMIUM"
  | "FASTEST"
  | "LOCAL_FIRST";

export interface ExperienceWeights {
  priceBps: number;
  confidenceBps: number;
  availabilityBps: number;
  localBps: number;
  qualityBps: number;
}

const MODES: Record<ExperienceMode, ExperienceWeights> = {
  BEST_VALUE: { priceBps: 3_000, confidenceBps: 2_000, availabilityBps: 2_000, localBps: 1_000, qualityBps: 2_000 },
  LOWEST_COST: { priceBps: 7_000, confidenceBps: 1_500, availabilityBps: 1_000, localBps: 500, qualityBps: 0 },
  PREMIUM: { priceBps: 500, confidenceBps: 2_000, availabilityBps: 1_000, localBps: 500, qualityBps: 6_000 },
  FASTEST: { priceBps: 1_000, confidenceBps: 1_500, availabilityBps: 5_000, localBps: 1_000, qualityBps: 1_500 },
  LOCAL_FIRST: { priceBps: 1_000, confidenceBps: 2_000, availabilityBps: 1_500, localBps: 5_000, qualityBps: 1_000 },
};

export function getExperienceWeights(mode: ExperienceMode): ExperienceWeights {
  return { ...MODES[mode] };
}

export function assertExperienceWeights(weights: ExperienceWeights): void {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (total !== 10_000) throw new Error("experience weights must total 10000 basis points");
  if (Object.values(weights).some((value) => !Number.isInteger(value) || value < 0 || value > 10_000)) {
    throw new Error("experience weights must be integer basis points between 0 and 10000");
  }
}
