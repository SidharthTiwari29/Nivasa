import { describe, expect, it } from "vitest";
import { rankSubstitutions } from "./substitutionService";
import type { MarketObservation, ProductVariant } from "./source-domain";

const variant = (
  id: string,
  attributes: Record<string, string>,
): ProductVariant => ({
  id,
  canonicalProductId: "product-1",
  attributes,
});

const observation = (
  id: string,
  variantId: string,
  amountMinor: bigint,
  available = true,
  confidenceBps = 9_000,
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
    observedAt: new Date("2026-08-26T00:00:00.000Z"),
  },
  amountMinor,
  currency: "INR",
  available,
  confidenceBps,
  truth: "VERIFIED",
});

describe("rankSubstitutions", () => {
  it("ranks a cheaper available variant as a lower-cost substitution", () => {
    const selected = variant("v1", { finish: "oak", size: "1200" });
    const candidate = variant("v2", { finish: "walnut", size: "1200" });

    const result = rankSubstitutions(
      selected,
      observation("selected", "v1", 100_000n),
      [
        {
          variant: candidate,
          observation: observation("candidate", "v2", 80_000n),
        },
      ],
    );

    expect(result[0]?.reasons).toContain("LOWER_COST");
    expect(result[0]?.observation.amountMinor).toBe(80_000n);
  });

  it("never crosses canonical product identity", () => {
    const selected = variant("v1", { finish: "oak" });
    const unrelated = {
      ...variant("v2", { finish: "oak" }),
      canonicalProductId: "product-2",
    };

    expect(
      rankSubstitutions(
        selected,
        observation("selected", "v1", 100_000n),
        [
          {
            variant: unrelated,
            observation: observation("candidate", "v2", 50_000n),
          },
        ],
      ),
    ).toEqual([]);
  });
});
