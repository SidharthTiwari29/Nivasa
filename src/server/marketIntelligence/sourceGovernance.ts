import {
  MARKET_SOURCE_CATALOG,
  MARKET_SOURCE_CATEGORIES,
  MARKET_SOURCE_TARGET,
} from "./sourceCatalog";
import type { MarketSourceDefinition } from "./sourceRegistry";

export type SourceAccessStatus =
  "UNKNOWN" | "REVIEW_REQUIRED" | "APPROVED" | "BLOCKED" | "EXPIRED";

export interface GovernedMarketSource extends MarketSourceDefinition {
  accessStatus: SourceAccessStatus;
  termsReference: string | null;
  licensingStatus: "UNKNOWN" | "REVIEW_REQUIRED" | "APPROVED" | "RESTRICTED";
  freshnessPolicyHours: number | null;
}

export const GOVERNED_SOURCE_CATALOG: readonly GovernedMarketSource[] =
  MARKET_SOURCE_CATALOG.map((source) => ({
    ...source,
    accessStatus: "UNKNOWN",
    termsReference: null,
    licensingStatus: "UNKNOWN",
    freshnessPolicyHours: null,
    ingestionEligible: false,
  }));

export interface SourceGovernanceAudit {
  total: number;
  target: number;
  targetReached: boolean;
  unreviewed: string[];
  approved: string[];
  blocked: string[];
  missingCategoryCoverage: string[];
}

export const auditSourceGovernance = (
  sources: readonly GovernedMarketSource[] = GOVERNED_SOURCE_CATALOG,
): SourceGovernanceAudit => {
  const covered = new Set(sources.flatMap((source) => source.categories));
  return {
    total: sources.length,
    target: MARKET_SOURCE_TARGET,
    targetReached: sources.length >= MARKET_SOURCE_TARGET,
    unreviewed: sources
      .filter((source) => source.accessStatus !== "APPROVED")
      .map((source) => source.key),
    approved: sources
      .filter((source) => source.accessStatus === "APPROVED")
      .map((source) => source.key),
    blocked: sources
      .filter((source) => source.accessStatus === "BLOCKED")
      .map((source) => source.key),
    missingCategoryCoverage: MARKET_SOURCE_CATEGORIES.filter(
      (category) => !covered.has(category),
    ),
  };
};

export const assertSourceCanIngest = (source: GovernedMarketSource): void => {
  if (source.accessStatus !== "APPROVED") {
    throw new Error(`Market source access is not approved: ${source.key}`);
  }
  if (source.licensingStatus !== "APPROVED") {
    throw new Error(`Market source licensing is not approved: ${source.key}`);
  }
  if (!source.termsReference) {
    throw new Error(`Market source terms reference is missing: ${source.key}`);
  }
  if (!source.ingestionEligible) {
    throw new Error(`Market source is not ingestion eligible: ${source.key}`);
  }
};
