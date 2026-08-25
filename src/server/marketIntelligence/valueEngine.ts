export type ValueTier =
  | "PREMIUM"
  | "BEST_OVERALL"
  | "SMART_BUY"
  | "BEST_VALUE"
  | "BUDGET_PICK"
  | "DEAL";

export interface ValueCandidate {
  id: string;
  priceMinor: bigint;
  qualityScoreBps: number;
  compatibilityScoreBps: number;
  durabilityScoreBps: number;
  designFitScoreBps: number;
  evidenceConfidenceBps: number;
  previousPriceMinor?: bigint;
  normalPriceMinor?: bigint;
  savingsMinor?: bigint;
  tradeOffs: string[];
}

export interface RankedValueCandidate extends ValueCandidate {
  valueScoreBps: number;
  dealScoreBps: number;
  tier: ValueTier;
  explanation: string[];
}

const clamp = (value: number): number => Math.max(0, Math.min(10000, value));

const savingsScore = (candidate: ValueCandidate): number => {
  const reference = candidate.normalPriceMinor ?? candidate.previousPriceMinor;
  if (!reference || reference <= candidate.priceMinor) return 0;
  return clamp(
    Number(((reference - candidate.priceMinor) * 10000n) / reference),
  );
};

export const rankValueCandidates = (
  candidates: readonly ValueCandidate[],
  budgetMinor?: bigint,
): RankedValueCandidate[] => {
  return [...candidates]
    .map((candidate) => {
      const dealScoreBps = savingsScore(candidate);
      const budgetScoreBps =
        budgetMinor && candidate.priceMinor <= budgetMinor
          ? 10000
          : budgetMinor
            ? clamp(Number((budgetMinor * 10000n) / candidate.priceMinor))
            : 5000;

      const valueScoreBps = Math.round(
        candidate.qualityScoreBps * 0.25 +
          candidate.compatibilityScoreBps * 0.25 +
          candidate.durabilityScoreBps * 0.15 +
          candidate.designFitScoreBps * 0.1 +
          candidate.evidenceConfidenceBps * 0.1 +
          budgetScoreBps * 0.1 +
          dealScoreBps * 0.05,
      );

      const tier: ValueTier =
        dealScoreBps >= 2500 && candidate.evidenceConfidenceBps >= 7000
          ? "DEAL"
          : candidate.qualityScoreBps >= 8500 && valueScoreBps >= 8000
            ? "PREMIUM"
            : valueScoreBps >= 8000
              ? "BEST_OVERALL"
              : valueScoreBps >= 7000
                ? "SMART_BUY"
                : valueScoreBps >= 6000
                  ? "BEST_VALUE"
                  : budgetScoreBps >= 8500
                    ? "BUDGET_PICK"
                    : "BEST_VALUE";

      const explanation = [
        `Value score ${valueScoreBps}/10000`,
        `Quality ${candidate.qualityScoreBps}/10000`,
        `Compatibility ${candidate.compatibilityScoreBps}/10000`,
        `Evidence confidence ${candidate.evidenceConfidenceBps}/10000`,
      ];

      if (dealScoreBps > 0) {
        explanation.push(`Observed saving score ${dealScoreBps}/10000`);
      }
      explanation.push(...candidate.tradeOffs.map((tradeOff) => `Trade-off: ${tradeOff}`));

      return { ...candidate, valueScoreBps, dealScoreBps, tier, explanation };
    })
    .sort((a, b) => b.valueScoreBps - a.valueScoreBps);
};
