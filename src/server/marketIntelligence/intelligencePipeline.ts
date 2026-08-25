import type { MarketSourceDefinition } from "./sourceRegistry";
import type { RawMarketRecord } from "./ingestion";
import { normalizeMarketRecords } from "./ingestion";
import { marketRepository } from "./marketRepository";
import { rankValueCandidates, type RankedValueCandidate } from "./valueEngine";

export interface IntelligencePipelineInput {
  sources: readonly MarketSourceDefinition[];
  records: readonly RawMarketRecord[];
  sourceIds: ReadonlyMap<string, string>;
  sourceProductIds?: ReadonlyMap<string, string>;
  budgetMinor?: bigint;
}

export interface IntelligencePipelineResult {
  persistedProductIds: string[];
  ranked: RankedValueCandidate[];
}

/**
 * Vertical boundary from governed source records to transparent market
 * recommendations. Persistence happens before ranking so recommendations are
 * always backed by durable observations.
 */
export const runIntelligencePipeline = async (
  input: IntelligencePipelineInput,
): Promise<IntelligencePipelineResult> => {
  const normalized = normalizeMarketRecords(input.sources, input.records);
  const persistedProductIds: string[] = [];
  const candidates = [];

  for (const product of normalized) {
    const sourceId = input.sourceIds.get(product.sourceKey);
    if (!sourceId) throw new Error(`Missing persisted source ID: ${product.sourceKey}`);

    const productId = await marketRepository.upsertCanonicalProduct(product);
    const sourceProductId = await marketRepository.upsertSourceProduct({
      sourceId,
      productId,
      sourceProductId: product.externalId,
      sku: product.sku,
      url: product.sourceUrl,
      titleObserved: product.name,
      sourceAttributes: product.attributes,
      seenAt: product.observedAt,
    });

    if (product.priceMinor !== undefined) {
      await marketRepository.appendPriceObservation({
        sourceProductId,
        observedAt: product.observedAt,
        amountMinor: product.priceMinor,
        listAmountMinor: product.mrpMinor,
        currency: "INR",
        unit: product.unit ?? "item",
        evidence: {
          sourceKey: product.sourceKey,
          externalId: product.externalId,
          sourceUrl: product.sourceUrl,
        },
        retrievalMethod: "SOURCE_ADAPTER",
      });
    }

    persistedProductIds.push(productId);
    candidates.push({
      id: productId,
      priceMinor: product.priceMinor ?? 0n,
      qualityScoreBps: Number(product.attributes.qualityScoreBps ?? 5000),
      compatibilityScoreBps: Number(
        product.attributes.compatibilityScoreBps ?? 5000,
      ),
      durabilityScoreBps: Number(product.attributes.durabilityScoreBps ?? 5000),
      designFitScoreBps: Number(product.attributes.designFitScoreBps ?? 5000),
      evidenceConfidenceBps: Number(product.attributes.evidenceConfidenceBps ?? 5000),
      normalPriceMinor: product.mrpMinor,
      tradeOffs: [],
    });
  }

  return {
    persistedProductIds,
    ranked: rankValueCandidates(candidates, input.budgetMinor),
  };
};
