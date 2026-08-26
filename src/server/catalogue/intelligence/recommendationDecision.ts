import type { MarketObservation } from "./source-domain";
import { validateConfidenceBps } from "./source-domain";

export type RecommendationMode =
  "BEST_VALUE" | "LOWEST_COST" | "PREMIUM" | "FASTEST" | "LOCAL_FIRST";

export interface RecommendationDecision {
  observationId: string;
  mode: RecommendationMode;
  score: number;
  reasons: string[];
  evidence: {
    sourceId: string;
    evidenceId: string;
    observedAt: Date;
    truth: MarketObservation["truth"];
    confidenceBps: number;
  };
}

const weights: Record<
  RecommendationMode,
  { price: number; confidence: number; availability: number; locality: number }
> = {
  BEST_VALUE: {
    price: 0.4,
    confidence: 0.25,
    availability: 0.2,
    locality: 0.15,
  },
  LOWEST_COST: {
    price: 0.75,
    confidence: 0.1,
    availability: 0.1,
    locality: 0.05,
  },
  PREMIUM: { price: 0.1, confidence: 0.3, availability: 0.25, locality: 0.05 },
  FASTEST: { price: 0.1, confidence: 0.15, availability: 0.65, locality: 0.05 },
  LOCAL_FIRST: {
    price: 0.2,
    confidence: 0.2,
    availability: 0.2,
    locality: 0.4,
  },
};

function score(
  observation: MarketObservation,
  mode: RecommendationMode,
  baselineMinor: bigint,
  locality: string | undefined,
): number {
  validateConfidenceBps(observation.confidenceBps);
  const w = weights[mode];
  const priceScore =
    baselineMinor <= 0n
      ? 0
      : Math.max(
          0,
          1 - Number(observation.amountMinor) / Number(baselineMinor),
        );
  const availabilityScore = observation.available ? 1 : 0;
  const localityScore =
    locality && observation.geography?.toLowerCase() === locality.toLowerCase()
      ? 1
      : 0;
  return (
    priceScore * w.price +
    (observation.confidenceBps / 10_000) * w.confidence +
    availabilityScore * w.availability +
    localityScore * w.locality
  );
}

export function explainRecommendation(
  observation: MarketObservation,
  mode: RecommendationMode,
  baselineMinor: bigint,
  locality?: string,
): RecommendationDecision {
  const reasons: string[] = [];
  if (observation.available) reasons.push("available");
  if (observation.amountMinor < baselineMinor)
    reasons.push("lower observed price");
  if (observation.confidenceBps >= 9_000)
    reasons.push("high-confidence evidence");
  if (
    locality &&
    observation.geography?.toLowerCase() === locality.toLowerCase()
  )
    reasons.push("local source");

  return {
    observationId: observation.observationId,
    mode,
    score: score(observation, mode, baselineMinor, locality),
    reasons,
    evidence: {
      sourceId: observation.source.sourceId,
      evidenceId: observation.evidence.evidenceId,
      observedAt: observation.evidence.observedAt,
      truth: observation.truth,
      confidenceBps: observation.confidenceBps,
    },
  };
}

export function rankWithExplanation(
  observations: readonly MarketObservation[],
  mode: RecommendationMode,
  baselineMinor: bigint,
  locality?: string,
): RecommendationDecision[] {
  return observations
    .map((item) => explainRecommendation(item, mode, baselineMinor, locality))
    .sort(
      (a, b) =>
        b.score - a.score || a.observationId.localeCompare(b.observationId),
    );
}
