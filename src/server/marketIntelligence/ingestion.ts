import type { MarketCategory, MarketSourceDefinition } from "./sourceRegistry";

export interface RawMarketRecord {
  sourceKey: string;
  sourceUrl: string;
  externalId: string;
  fetchedAt: Date;
  name: string;
  brand?: string;
  category: MarketCategory;
  sku?: string;
  description?: string;
  currency: "INR";
  priceMinor?: bigint;
  mrpMinor?: bigint;
  unit?: string;
  attributes: Record<string, string | number | boolean>;
}

export interface CanonicalMarketProduct {
  sourceKey: string;
  externalId: string;
  canonicalKey: string;
  name: string;
  normalizedName: string;
  brand?: string;
  category: MarketCategory;
  sku?: string;
  description?: string;
  currency: "INR";
  priceMinor?: bigint;
  mrpMinor?: bigint;
  unit?: string;
  attributes: Record<string, string | number | boolean>;
  sourceUrl: string;
  observedAt: Date;
}

const normalizeText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");

const assertSource = (
  source: MarketSourceDefinition | undefined,
  record: RawMarketRecord,
): asserts source is MarketSourceDefinition => {
  if (!source) {
    throw new Error(`Unknown market source: ${record.sourceKey}`);
  }

  if (!source.ingestionEligible) {
    throw new Error(`Market source is not ingestion eligible: ${source.key}`);
  }
};

export const normalizeMarketRecord = (
  source: MarketSourceDefinition | undefined,
  record: RawMarketRecord,
): CanonicalMarketProduct => {
  assertSource(source, record);

  if (!record.sourceUrl.startsWith("https://")) {
    throw new Error("Market source URL must use HTTPS");
  }

  if (!record.externalId.trim() || !record.name.trim()) {
    throw new Error("Market records require an external ID and name");
  }

  const normalizedName = normalizeText(record.name);
  const normalizedBrand = record.brand
    ? normalizeText(record.brand)
    : undefined;
  const canonicalKey = [
    source.key,
    record.externalId.trim(),
    normalizedBrand ?? "",
    normalizedName,
  ]
    .filter(Boolean)
    .join(":");

  return {
    sourceKey: source.key,
    externalId: record.externalId.trim(),
    canonicalKey,
    name: record.name.trim(),
    normalizedName,
    brand: record.brand?.trim() || undefined,
    category: record.category,
    sku: record.sku?.trim() || undefined,
    description: record.description?.trim() || undefined,
    currency: "INR",
    priceMinor: record.priceMinor,
    mrpMinor: record.mrpMinor,
    unit: record.unit?.trim() || undefined,
    attributes: record.attributes,
    sourceUrl: record.sourceUrl,
    observedAt: record.fetchedAt,
  };
};

export const normalizeMarketRecords = (
  sources: readonly MarketSourceDefinition[],
  records: readonly RawMarketRecord[],
): CanonicalMarketProduct[] => {
  const sourceMap = new Map(sources.map((source) => [source.key, source]));
  const seen = new Set<string>();
  const normalized: CanonicalMarketProduct[] = [];

  for (const record of records) {
    const product = normalizeMarketRecord(
      sourceMap.get(record.sourceKey),
      record,
    );
    if (seen.has(product.canonicalKey)) {
      continue;
    }
    seen.add(product.canonicalKey);
    normalized.push(product);
  }

  return normalized;
};
