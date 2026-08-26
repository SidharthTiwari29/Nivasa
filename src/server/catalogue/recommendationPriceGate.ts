export interface CandidatePrice { catalogueItemId: string; amountMinor: bigint; evidenceId?: string; observedAt?: Date; }
export interface PriceDecision { accepted: boolean; reason?: string; }

export function validateRecommendationPrice(candidate: CandidatePrice, now = new Date()): PriceDecision {
  if (!candidate.catalogueItemId.trim()) return { accepted: false, reason: "CATALOGUE_ITEM_REQUIRED" };
  if (candidate.amountMinor < 0n) return { accepted: false, reason: "PRICE_INVALID" };
  if (!candidate.evidenceId) return { accepted: false, reason: "PRICE_EVIDENCE_REQUIRED" };
  if (!candidate.observedAt || candidate.observedAt.getTime() > now.getTime()) return { accepted: false, reason: "OBSERVATION_DATE_INVALID" };
  return { accepted: true };
}
