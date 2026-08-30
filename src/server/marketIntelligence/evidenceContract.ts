export type EvidenceQuality = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type EvidenceObservation = {
  sourceKey: string;
  sourceProductId?: string;
  retrievedAt: Date;
  retrievalMethod: "OFFICIAL_SITE" | "PARTNER_FEED" | "MANUAL_IMPORT";
  locator?: string;
  contentHash?: string;
  excerpt?: string;
  metadata?: Record<string, unknown>;
};

export type EvidencePolicy = {
  freshnessHours: number;
  requireLocator: boolean;
  requireContentHash: boolean;
};

export type EvidenceValidation = {
  quality: EvidenceQuality;
  fresh: boolean;
  reasons: string[];
};

const assertNonBlank = (value: string, field: string): void => {
  if (!value.trim()) throw new Error(`${field} is required`);
};

export const validateEvidenceObservation = (
  observation: EvidenceObservation,
): void => {
  assertNonBlank(observation.sourceKey, "sourceKey");
  if (observation.sourceProductId !== undefined) {
    assertNonBlank(observation.sourceProductId, "sourceProductId");
  }
  if (
    !(observation.retrievedAt instanceof Date) ||
    Number.isNaN(observation.retrievedAt.getTime())
  ) {
    throw new Error("retrievedAt must be a valid Date");
  }
  if (observation.locator !== undefined)
    assertNonBlank(observation.locator, "locator");
  if (observation.contentHash !== undefined)
    assertNonBlank(observation.contentHash, "contentHash");
};

export const validateEvidencePolicy = (policy: EvidencePolicy): void => {
  if (!Number.isFinite(policy.freshnessHours) || policy.freshnessHours <= 0) {
    throw new Error("freshnessHours must be greater than zero");
  }
};

export const evaluateEvidence = (
  observation: EvidenceObservation,
  policy: EvidencePolicy,
  now: Date,
): EvidenceValidation => {
  validateEvidenceObservation(observation);
  validateEvidencePolicy(policy);
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date");
  }

  const reasons: string[] = [];
  const ageHours =
    (now.getTime() - observation.retrievedAt.getTime()) / 3_600_000;
  const fresh = ageHours >= 0 && ageHours <= policy.freshnessHours;

  if (ageHours < 0) reasons.push("observation timestamp is in the future");
  if (!fresh) reasons.push("observation is outside the freshness policy");
  if (policy.requireLocator && !observation.locator)
    reasons.push("locator is required");
  if (policy.requireContentHash && !observation.contentHash)
    reasons.push("contentHash is required");

  const hasRequiredFields =
    (!policy.requireLocator || Boolean(observation.locator)) &&
    (!policy.requireContentHash || Boolean(observation.contentHash));

  let quality: EvidenceQuality = "UNKNOWN";
  if (fresh && hasRequiredFields) {
    quality =
      observation.retrievalMethod === "OFFICIAL_SITE" ? "HIGH" : "MEDIUM";
  } else if (fresh) {
    quality = "LOW";
  }

  return { quality, fresh, reasons };
};

export const mergeEvidenceMetadata = (
  existing: Record<string, unknown> | undefined,
  incoming: Record<string, unknown> | undefined,
): Record<string, unknown> => ({
  ...(existing ?? {}),
  ...(incoming ?? {}),
});
