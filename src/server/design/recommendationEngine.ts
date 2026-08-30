export type RecommendationCandidate = {
  catalogueItemId: string;
  name: string;
  category: string;
  room?: string;
  styleTags?: string[];
  priceMinor?: number;
  evidenceQuality?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
};

export type RecommendationContext = {
  room?: string;
  requiredCategory?: string;
  preferredStyles?: string[];
  maxPriceMinor?: number;
};

export type Recommendation = RecommendationCandidate & {
  score: number;
  reasons: string[];
};

const normalise = (value: string): string => value.trim().toLocaleLowerCase();

const qualityScore = (quality: RecommendationCandidate["evidenceQuality"]): number => ({
  HIGH: 30,
  MEDIUM: 20,
  LOW: 10,
  UNKNOWN: 0,
}[quality ?? "UNKNOWN"]);

export const recommendDesignCandidates = (
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
): Recommendation[] => candidates
  .map((candidate) => {
    const reasons: string[] = [];
    let score = qualityScore(candidate.evidenceQuality);

    if (context.requiredCategory && normalise(candidate.category) === normalise(context.requiredCategory)) {
      score += 25;
      reasons.push("matches required category");
    }

    if (context.room && candidate.room && normalise(candidate.room) === normalise(context.room)) {
      score += 20;
      reasons.push("matches room");
    }

    const candidateStyles = new Set((candidate.styleTags ?? []).map(normalise));
    const matchedStyles = (context.preferredStyles ?? []).filter((style) => candidateStyles.has(normalise(style)));
    if (matchedStyles.length > 0) {
      score += Math.min(20, matchedStyles.length * 10);
      reasons.push(`matches preferred style: ${matchedStyles.join(", ")}`);
    }

    if (context.maxPriceMinor !== undefined && candidate.priceMinor !== undefined && candidate.priceMinor <= context.maxPriceMinor) {
      score += 15;
      reasons.push("within budget constraint");
    }

    if (candidate.priceMinor === undefined) {
      reasons.push("price is unknown; budget fit is not asserted");
    }

    if (reasons.length === 0) reasons.push("no specific constraint match; evidence quality only");
    return { ...candidate, score, reasons };
  })
  .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
