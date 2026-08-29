import { describe, expect, it, vi } from "vitest";
import { runIntelligencePipeline } from "./intelligencePipeline";

vi.mock("./marketRepository", () => ({
  marketRepository: {
    upsertCanonicalProduct: vi.fn(async () => "product-1"),
    upsertSourceProduct: vi.fn(async () => "source-product-1"),
    appendPriceObservation: vi.fn(async () => "observation-1"),
  },
}));

describe("runIntelligencePipeline", () => {
  it("persists the observation before returning a ranked recommendation", async () => {
    const result = await runIntelligencePipeline({
      sources: [
        {
          key: "approved-source",
          name: "Approved Source",
          category: "RETAILER",
          ingestionEligible: true,
        } as never,
      ],
      sourceIds: new Map([["approved-source", "source-1"]]),
      records: [
        {
          sourceKey: "approved-source",
          sourceUrl: "https://example.com/product-1",
          externalId: "SKU-1",
          fetchedAt: new Date("2026-08-25T13:00:00Z"),
          name: "Premium Hinge",
          brand: "Example",
          category: "hardware",
          sku: "SKU-1",
          currency: "INR",
          priceMinor: 350000n,
          mrpMinor: 450000n,
          unit: "pack",
          attributes: {
            qualityScoreBps: 8500,
            compatibilityScoreBps: 9000,
            durabilityScoreBps: 8500,
            designFitScoreBps: 8000,
            evidenceConfidenceBps: 9000,
          },
        },
      ],
      budgetMinor: 400000n,
    });

    expect(result.persistedProductIds).toEqual(["product-1"]);
    expect(result.ranked[0]?.id).toBe("product-1");
    expect(result.ranked[0]?.dealScoreBps).toBeGreaterThan(0);
  });

  it("normalizes common pack aliases through the pipeline", async () => {
    const result = await runIntelligencePipeline({
      sources: [
        {
          key: "approved-source",
          name: "Approved Source",
          category: "RETAILER",
          ingestionEligible: true,
        } as never,
      ],
      sourceIds: new Map([["approved-source", "source-1"]]),
      records: [
        {
          sourceKey: "approved-source",
          sourceUrl: "https://example.com/product-2",
          externalId: "SKU-2",
          fetchedAt: new Date("2026-08-25T13:00:00Z"),
          name: "Hardware Pack",
          brand: "Example",
          category: "hardware",
          sku: "SKU-2",
          currency: "INR",
          priceMinor: 100000n,
          mrpMinor: 120000n,
          unit: "packs",
          attributes: {
            qualityScoreBps: 8000,
            compatibilityScoreBps: 8000,
            durabilityScoreBps: 8000,
            designFitScoreBps: 8000,
            evidenceConfidenceBps: 9000,
          },
        },
      ],
      budgetMinor: 150000n,
    });

    expect(result.persistedProductIds).toEqual(["product-1"]);
  });
});
