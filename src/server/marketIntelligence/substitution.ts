export type SubstitutionCandidate = {
  id: string;
  name: string;
  priceMinor: bigint | null;
  qualityImpact: "BETTER" | "SIMILAR" | "LOWER" | "UNKNOWN";
  maintenanceImpact: "BETTER" | "SIMILAR" | "HIGHER" | "UNKNOWN";
  durabilityImpact: "BETTER" | "SIMILAR" | "LOWER" | "UNKNOWN";
  appearanceImpact: "BETTER" | "SIMILAR" | "DIFFERENT" | "UNKNOWN";
  explanation: string;
  evidenceIds: string[];
};

export type RankedSubstitution = SubstitutionCandidate & {
  savingMinor: bigint | null;
  priceDeltaMinor: bigint | null;
  confidenceBps: number;
  decision: "SAVE" | "UPGRADE" | "TRADE_OFF" | "UNKNOWN";
};

const impactScore = (value: SubstitutionCandidate["qualityImpact"]): number => {
  switch (value) {
    case "BETTER":
      return 1000;
    case "SIMILAR":
      return 500;
    case "LOWER":
      return -1000;
    default:
      return 0;
  }
};

export const rankSubstitutions = (
  currentPriceMinor: bigint | null,
  candidates: readonly SubstitutionCandidate[],
): RankedSubstitution[] =>
  candidates
    .map((candidate) => {
      const priceDeltaMinor =
        currentPriceMinor !== null && candidate.priceMinor !== null
          ? candidate.priceMinor - currentPriceMinor
          : null;
      const savingMinor =
        priceDeltaMinor === null ? null : -priceDeltaMinor;
      const confidenceBps = Math.max(
        0,
        Math.min(10000, 5000 + candidate.evidenceIds.length * 1000),
      );
      const quality = impactScore(candidate.qualityImpact);
      const decision =
        priceDeltaMinor === null
          ? "UNKNOWN"
          : quality > 0 && priceDeltaMinor > 0n
            ? "UPGRADE"
            : quality >= 0 && priceDeltaMinor < 0n
              ? "SAVE"
              : "TRADE_OFF";

      return {
        ...candidate,
        savingMinor,
        priceDeltaMinor,
        confidenceBps,
        decision,
      };
    })
    .sort((a, b) => {
      const confidence = b.confidenceBps - a.confidenceBps;
      if (confidence !== 0) return confidence;
      const aSaving = a.savingMinor ?? -1n;
      const bSaving = b.savingMinor ?? -1n;
      return aSaving > bSaving ? -1 : aSaving < bSaving ? 1 : 0;
    });
