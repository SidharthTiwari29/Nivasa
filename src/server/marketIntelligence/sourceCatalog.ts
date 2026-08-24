import {
  MARKET_SOURCE_REGISTRY,
  type MarketCategory,
  type MarketSourceDefinition,
} from "./sourceRegistry";
import { MARKET_SOURCE_EXPANSION } from "./sourceRegistryExpansion";

export const MARKET_SOURCE_CATALOG: readonly MarketSourceDefinition[] = [
  ...MARKET_SOURCE_REGISTRY,
  ...MARKET_SOURCE_EXPANSION,
];

export const MARKET_SOURCE_TARGET = 500;

export const MARKET_SOURCE_CATEGORIES: readonly MarketCategory[] = [
  "furniture",
  "wardrobes-storage",
  "kitchens-cabinetry",
  "bathroom-sanitary-plumbing",
  "tiles-surfaces",
  "paint-wall-finishes",
  "boards-laminates-veneers",
  "hardware",
  "ceiling-acoustic",
  "lighting",
  "electrical",
  "fans-smart-home",
  "flooring",
  "curtains-blinds",
  "doors-glass",
  "soft-furnishings-decor",
  "appliances",
  "outdoor",
  "designers-services",
];

const isValidDomain = (domain: string): boolean =>
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[^\s]*)?$/i.test(
    domain,
  );

export interface SourceCatalogAudit {
  total: number;
  target: number;
  targetReached: boolean;
  duplicateKeys: string[];
  duplicateDomains: string[];
  invalidDomains: string[];
  missingCategories: MarketCategory[];
  ingestionEligibleCount: number;
}

export const auditSourceCatalog = (
  sources: readonly MarketSourceDefinition[] = MARKET_SOURCE_CATALOG,
): SourceCatalogAudit => {
  const keys = new Map<string, number>();
  const domains = new Map<string, number>();
  const categories = new Set<MarketCategory>();
  let ingestionEligibleCount = 0;

  for (const source of sources) {
    keys.set(source.key, (keys.get(source.key) ?? 0) + 1);
    domains.set(source.domain, (domains.get(source.domain) ?? 0) + 1);
    source.categories.forEach((category) => categories.add(category));
    if (source.ingestionEligible) ingestionEligibleCount += 1;
  }

  return {
    total: sources.length,
    target: MARKET_SOURCE_TARGET,
    targetReached: sources.length >= MARKET_SOURCE_TARGET,
    duplicateKeys: [...keys.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
    duplicateDomains: [...domains.entries()]
      .filter(([, count]) => count > 1)
      .map(([domain]) => domain),
    invalidDomains: sources
      .filter((source) => !isValidDomain(source.domain))
      .map((source) => `${source.key}:${source.domain}`),
    missingCategories: MARKET_SOURCE_CATEGORIES.filter(
      (category) => !categories.has(category),
    ),
    ingestionEligibleCount,
  };
};

export const assertSourceCatalogIntegrity = (
  sources: readonly MarketSourceDefinition[] = MARKET_SOURCE_CATALOG,
): void => {
  const audit = auditSourceCatalog(sources);
  if (audit.duplicateKeys.length > 0) {
    throw new Error(
      `Duplicate market source keys: ${audit.duplicateKeys.join(", ")}`,
    );
  }
  if (audit.invalidDomains.length > 0) {
    throw new Error(
      `Invalid market source domains: ${audit.invalidDomains.join(", ")}`,
    );
  }
  if (audit.missingCategories.length > 0) {
    throw new Error(
      `Missing market source categories: ${audit.missingCategories.join(", ")}`,
    );
  }
};
