export type RecommendationMode = "BEST_VALUE" | "LOWEST_COST" | "PREMIUM" | "FASTEST" | "LOCAL_FIRST";

export interface RecommendationCandidate { id: string; priceMinor: bigint; score: number; deliveryDays?: number; local?: boolean; evidenceBacked: boolean; }
export interface RecommendationDecision { candidateId: string; mode: RecommendationMode; reason: string; }

export function chooseRecommendation(mode: RecommendationMode, candidates: readonly RecommendationCandidate[]): RecommendationDecision {
  const eligible = candidates.filter((candidate) => candidate.evidenceBacked && candidate.priceMinor >= 0n && Number.isFinite(candidate.score));
  if (!eligible.length) throw new Error("no evidence-backed recommendation candidates");
  const sorted = [...eligible].sort((a, b) => {
    if (mode === "LOWEST_COST") return a.priceMinor < b.priceMinor ? -1 : a.priceMinor > b.priceMinor ? 1 : a.id.localeCompare(b.id);
    if (mode === "PREMIUM") return b.score - a.score || (b.priceMinor > a.priceMinor ? 1 : b.priceMinor < a.priceMinor ? -1 : a.id.localeCompare(b.id));
    if (mode === "FASTEST") return (a.deliveryDays ?? Number.MAX_SAFE_INTEGER) - (b.deliveryDays ?? Number.MAX_SAFE_INTEGER) || a.id.localeCompare(b.id);
    if (mode === "LOCAL_FIRST") return Number(b.local) - Number(a.local) || b.score - a.score || a.id.localeCompare(b.id);
    return b.score - a.score || (a.priceMinor < b.priceMinor ? -1 : a.priceMinor > b.priceMinor ? 1 : a.id.localeCompare(b.id));
  });
  const candidate = sorted[0];
  return { candidateId: candidate.id, mode, reason: `selected by ${mode.toLowerCase()} from evidence-backed candidates` };
}
