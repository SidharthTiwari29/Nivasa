import { describe, expect, it, vi } from "vitest";
import { dealIntelligenceService } from "./dealIntelligenceService";
import { marketIntelligenceRepository } from "@/server/repositories/marketIntelligenceRepository";
import type { MarketObservation } from "@/server/catalogue/intelligence/source-domain";

const observation = (
  id: string,
  variantId: string,
  amountMinor: bigint,
  truth: MarketObservation["truth"] = "VERIFIED",
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
    verifiedAt:
      truth === "VERIFIED" ? new Date("2026-08-29T00:00:00.000Z") : undefined,
  },
  amountMinor,
  currency: "INR",
  available: true,
  geography: "Bengaluru",
  confidenceBps: 9_000,
  truth,
});

describe("dealIntelligenceService", () => {
  it("compares the exact selected variant and distinguishes verified deals", async () => {
    vi.spyOn(
      marketIntelligenceRepository,
      "findObservationForOwnerlessDecision",
    ).mockResolvedValue(observation("baseline", "variant-1", 100_000n));
    vi.spyOn(
      marketIntelligenceRepository,
      "listExactVariantObservations",
    ).mockResolvedValue([observation("deal", "variant-1", 75_000n)]);

    const result = await dealIntelligenceService.findForObservation({
      observationId: "baseline",
    });

    expect(result.deals[0]?.savingMinor).toBe(25_000n);
    expect(result.deals[0]?.classification).toBe("VERIFIED_DEAL");
  });

  it("refuses to compare an observation without a variant/SKU", async () => {
    vi.spyOn(
      marketIntelligenceRepository,
      "findObservationForOwnerlessDecision",
    ).mockResolvedValue({
      ...observation("baseline", "variant-1", 100_000n),
      variantId: undefined,
    });

    await expect(
      dealIntelligenceService.findForObservation({ observationId: "baseline" }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
