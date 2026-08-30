export type ProductCandidate = {
  catalogueItemId: string;
  name: string;
  category: string;
  unit: string;
  priceMinor?: number;
  currency?: string;
  available?: boolean;
  evidenceQuality?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
};

export type ProductConstraint = {
  category?: string;
  unit?: string;
  maxPriceMinor?: number;
  requireAvailable?: boolean;
};

const normalise = (value: string): string => value.trim().toLocaleLowerCase();

export const normaliseProductCandidate = (candidate: ProductCandidate): ProductCandidate => ({
  ...candidate,
  name: candidate.name.trim(),
  category: normalise(candidate.category),
  unit: normalise(candidate.unit),
  currency: candidate.currency?.trim().toUpperCase(),
});

export const matchesProductConstraint = (
  candidate: ProductCandidate,
  constraint: ProductConstraint,
): boolean => {
  const product = normaliseProductCandidate(candidate);
  if (constraint.category && product.category !== normalise(constraint.category)) return false;
  if (constraint.unit && product.unit !== normalise(constraint.unit)) return false;
  if (constraint.maxPriceMinor !== undefined &&
      (product.priceMinor === undefined || product.priceMinor > constraint.maxPriceMinor)) return false;
  if (constraint.requireAvailable && product.available !== true) return false;
  return true;
};

export const rankProductCandidates = (
  candidates: ProductCandidate[],
  constraint: ProductConstraint = {},
): ProductCandidate[] => candidates
  .filter((candidate) => matchesProductConstraint(candidate, constraint))
  .map(normaliseProductCandidate)
  .sort((left, right) => {
    const quality = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };
    const evidenceDelta = (quality[right.evidenceQuality ?? "UNKNOWN"] ?? 0) -
      (quality[left.evidenceQuality ?? "UNKNOWN"] ?? 0);
    if (evidenceDelta !== 0) return evidenceDelta;
    if (left.priceMinor === undefined) return 1;
    if (right.priceMinor === undefined) return -1;
    return left.priceMinor - right.priceMinor;
  });
