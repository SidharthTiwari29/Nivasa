import type { MarketObservation } from "./source-domain";
import { validateConfidenceBps } from "./source-domain";

export type RecommendationMode = "BEST_VALUE" | "LOWEST_COST" | "PREMIUM" | "FASTEST" | "LOCAL_FIRST";

export interface RecommendationSignals {
  qualityBps?: number;
  deliveryDays?: number;
  localBps?: number;
}

export interface RecommendationCandidate {
  observation: MarketObservation;
  signals?: RecommendationSignals;
}

export interface Recommendation {
  observation: MarketObservation;
  scoreBps: number;
  reasons: string[];
}

const weights: Record<RecommendationMode, { price: number; confidence: number; availability: number; quality: number; speed: number; local: number }> = {
  BEST_VALUE: { price: 4, confidence: 2, availability: 1, quality: 2, speed: 0, local: 1 },
  LOWEST_COST: { price: 8, confidence: 1, availability: 1, quality: 0, speed: 0, local: 0 },
  PREMIUM: { price: 0, confidence: 3, availability: 1, quality: 6, speed: 0, local: 0 },
  FASTEST: { price: 1, confidence: 2, availability: 2, quality: 1, speed: 4, local: 0 },
  LOCAL_FIRST: { price: 2, confidence: 2, availability: 1, quality: 1, speed: 0, local: 4 },
};

function bounded(value: number | undefined): number {
  if (value === undefined) return 0;
  return Math.max(0, Math.min(10_000, value));
}

export function recommend(mode: RecommendationMode, candidates: readonly RecommendationCandidate[]): Recommendation[] {
  const w = weights[mode];
  if (!w) throw new Error("unsupported recommendation mode");
  const maxPrice = candidates.reduce((max, c) => c.observation.amountMinor > max ? c.observation.amountMinor : max, 0n);
  const maxDays = candidates.reduce((max, c) => Math.max(max, c.signals?.deliveryDays ?? 0), 0);

  return candidates.map(({ observation, signals }) => {
    validateConfidenceBps(observation.confidenceBps);
    const priceBps = maxPrice === 0n ? 0 : Number(((maxPrice - observation.amountMinor) * 10_000n) / maxPrice);
    const speedBps = maxDays === 0 ? 0 : Math.round(((maxDays - (signals?.deliveryDays ?? maxDays)) / maxDays) * 10_000);
    const availabilityBps = observation.available ? 10_000 : 0;
    const qualityBps = bounded(signals?.qualityBps);
    const localBps = bounded(signals?.localBps);
    const scoreBps = Math.round((priceBps * w.price + observation.confidenceBps * w.confidence + availabilityBps * w.availability + qualityBps * w.quality + speedBps * w.speed + localBps * w.local) / 10);
    const reasons: string[] = [];
    if (w.price && priceBps > 0) reasons.push("better_price");
    if (w.confidence && observation.confidenceBps >= 9_000) reasons.push("high_confidence");
    if (observation.available) reasons.push("available");
    if (w.quality && qualityBps >= 8_000) reasons.push("high_quality");
    if (w.speed && speedBps >= 5_000) reasons.push("faster");
    if (w.local && localBps >= 8_000) reasons.push("local");
    return { observation, scoreBps, reasons };
  }).sort((a, b) => b.scoreBps - a.scoreBps || Number(a.observation.amountMinor - b.observation.amountMinor));
}
