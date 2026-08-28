import { prisma } from "@/server/db/prisma";
import type {
  EvidenceRef,
  MarketObservation,
  ProductVariant,
  SourceRef,
} from "@/server/catalogue/intelligence/source-domain";

const observationInclude = {
  source: true,
  evidence: { include: { source: true } },
} as const;

function toSourceRef(source: {
  id: string;
  kind: string;
  name: string;
  reference: string | null;
}): SourceRef {
  return {
    sourceId: source.id,
    kind: source.kind as SourceRef["kind"],
    name: source.name,
    ...(source.reference ? { reference: source.reference } : {}),
  };
}

function toEvidenceRef(evidence: {
  id: string;
  observedAt: Date;
  verifiedAt: Date | null;
  uri: string | null;
  excerpt: string | null;
  source: {
    id: string;
    kind: string;
    name: string;
    reference: string | null;
  };
}): EvidenceRef {
  return {
    evidenceId: evidence.id,
    source: toSourceRef(evidence.source),
    observedAt: evidence.observedAt,
    ...(evidence.verifiedAt ? { verifiedAt: evidence.verifiedAt } : {}),
    ...(evidence.uri ? { uri: evidence.uri } : {}),
    ...(evidence.excerpt ? { excerpt: evidence.excerpt } : {}),
  };
}

function toMarketObservation(row: {
  id: string;
  canonicalProductId: string;
  variantId: string | null;
  amountMinor: bigint;
  currency: string;
  available: boolean;
  geography: string | null;
  confidenceBps: number;
  truth: string;
  source: {
    id: string;
    kind: string;
    name: string;
    reference: string | null;
  };
  evidence: {
    id: string;
    observedAt: Date;
    verifiedAt: Date | null;
    uri: string | null;
    excerpt: string | null;
    source: {
      id: string;
      kind: string;
      name: string;
      reference: string | null;
    };
  };
}): MarketObservation {
  return {
    observationId: row.id,
    canonicalProductId: row.canonicalProductId,
    ...(row.variantId ? { variantId: row.variantId } : {}),
    source: toSourceRef(row.source),
    evidence: toEvidenceRef(row.evidence),
    amountMinor: row.amountMinor,
    currency: row.currency,
    available: row.available,
    ...(row.geography ? { geography: row.geography } : {}),
    confidenceBps: row.confidenceBps,
    truth: row.truth as MarketObservation["truth"],
  };
}

export const marketIntelligenceRepository = {
  async findObservationForOwnerlessDecision(observationId: string) {
    const row = await prisma.marketObservation.findUnique({
      where: { id: observationId },
      include: observationInclude,
    });
    return row ? toMarketObservation(row) : null;
  },

  async listExactVariantObservations(input: {
    variantId: string;
    excludeObservationId?: string;
    geography?: string;
    limit?: number;
  }) {
    const rows = await prisma.marketObservation.findMany({
      where: {
        variantId: input.variantId,
        ...(input.excludeObservationId
          ? { id: { not: input.excludeObservationId } }
          : {}),
        ...(input.geography ? { geography: input.geography } : {}),
      },
      include: observationInclude,
      orderBy: [{ observedAt: "desc" }, { amountMinor: "asc" }],
      take: input.limit ?? 50,
    });
    return rows.map(toMarketObservation);
  },

  async listVariantSubstitutions(input: {
    canonicalProductId: string;
    excludeVariantId: string;
    geography?: string;
    limit?: number;
  }) {
    const rows = await prisma.marketObservation.findMany({
      where: {
        canonicalProductId: input.canonicalProductId,
        variantId: { not: input.excludeVariantId },
        ...(input.geography ? { geography: input.geography } : {}),
      },
      include: observationInclude,
      orderBy: [{ observedAt: "desc" }, { amountMinor: "asc" }],
      take: input.limit ?? 100,
    });
    return rows.map(toMarketObservation);
  },

  async findVariant(variantId: string) {
    return prisma.productVariant.findUnique({ where: { id: variantId } });
  },

  async findVariants(variantIds: readonly string[]) {
    if (variantIds.length === 0) return [];
    return prisma.productVariant.findMany({
      where: { id: { in: [...new Set(variantIds)] } },
    });
  },

  async findCanonicalProduct(canonicalProductId: string) {
    return prisma.canonicalProduct.findUnique({
      where: { id: canonicalProductId },
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        description: true,
      },
    });
  },
};

export function toProductVariant(row: {
  id: string;
  canonicalProductId: string;
  sku: string | null;
  attributes: unknown;
}): ProductVariant {
  const attributes =
    row.attributes &&
    typeof row.attributes === "object" &&
    !Array.isArray(row.attributes)
      ? Object.fromEntries(
          Object.entries(row.attributes as Record<string, unknown>).map(
            ([key, value]) => [key, String(value)],
          ),
        )
      : {};

  return {
    id: row.id,
    canonicalProductId: row.canonicalProductId,
    ...(row.sku ? { sku: row.sku } : {}),
    attributes,
  };
}
