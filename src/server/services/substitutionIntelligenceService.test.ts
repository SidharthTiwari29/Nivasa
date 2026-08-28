import { describe, expect, it, vi } from "vitest";
import { substitutionIntelligenceService } from "./substitutionIntelligenceService";
import { marketIntelligenceRepository } from "@/server/repositories/marketIntelligenceRepository";
import type { MarketObservation } from "@/server/catalogue/intelligence/source-domain";

const observation = (
  id: string,
  variantId: string,
  amountMinor: bigint,
): MarketObservation => ({
  observationId: id,
  canonicalProductId: "product-1",
  variantId,
  source: {
    sourceId: `source-${id}`,
    kind: "RETAILER",
    name: `Retailer ${id}`,
  },
  evidence: {
    evidenceId: `evidence-${id}`,
    source: {
      sourceId: `source-${id}`,
      kind: "RETAILER",
      name: `Retailer ${id}`,
    },
    observedAt: new Date("2026-08-29T00:00:00.000Z"),
  },
  amountMinor,
  currency: "INR",
  available: true,
  geography: "Bengaluru",
  confidenceBps: 9_000,
  truth: "VERIFIED",
});

describe("substitutionIntelligenceService", () => {
  it("returns explicit variant changes without inventing quality trade-offs", async () => {
    vi.spyOn(marketIntelligenceRepository, "findVariant").mockResolvedValue({
      id: "variant-1",
      canonicalProductId: "product-1",
      sku: "SKU-1",
      attributes: { finish: "oak", size: "1200" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(marketIntelligenceRepository, "findObservationForOwnerlessDecision").mockResolvedValue(
      observation("selected", "variant-1", 100_000n),
    );
    vi.spyOn(marketIntelligenceRepository, "listVariantSubstitutions").mockResolvedValue([
      observation("candidate", "variant-2", 80_000n),
    ]);
    vi.spyOn(marketIntelligenceRepository, "findVariants").mockResolvedValue([
      {
        id: "variant-2",
        canonicalProductId: "product-1",
        sku: "SKU-2",
        attributes: { finish: "walnut", size: "1200" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await substitutionIntelligenceService.findForVariant({
      variantId: "variant-1",
      observationId: "selected",
    });

    expect(result.substitutions[0]?.savingMinor).toBe(20_000n);
    expect(result.substitutions[0]?.attributeChanges).toEqual([
      { attribute: "finish", from: "oak", to: "walnut" },
    ]);
    expect(result.substitutions[0]?.tradeoffStatus).toBe("NOT_ESTABLISHED");
  });
});
