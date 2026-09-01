import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { CanonicalMarketProduct } from "./ingestion";

export interface MarketEvidenceInput {
  sourceId: string;
  sourceProductId?: string;
  retrievedAt: Date;
  retrievalMethod: string;
  locator?: string;
  contentHash?: string;
  excerpt?: string;
  metadata?: Record<string, unknown>;
}

export interface MarketObservationInput {
  sourceProductId: string;
  observedAt: Date;
  amountMinor: bigint;
  listAmountMinor?: bigint;
  currency: "INR";
  unit: string;
  taxIncluded?: boolean;
  shippingIncluded?: boolean;
  installationIncluded?: boolean;
  location?: Record<string, unknown>;
  availability?: string;
  evidence: Record<string, unknown>;
  retrievalMethod: string;
  confidenceBps?: number;
  freshUntil?: Date;
}

export interface MarketIngestionRunInput {
  sourceId: string;
  idempotencyKey: string;
}

const json = (value: unknown) => JSON.stringify(value ?? null);

function assertPrice(value: bigint, field: string): void {
  if (value < 0n) throw new Error(`${field}_MUST_BE_NON_NEGATIVE`);
}

function assertConfidence(value: number | undefined): void {
  if (
    value !== undefined &&
    (value < 0 || value > 10000 || !Number.isInteger(value))
  ) {
    throw new Error("CONFIDENCE_BPS_OUT_OF_RANGE");
  }
}

/**
 * Persistence boundary for market intelligence. Source observations are
 * append-only: a changed price creates another observation rather than
 * mutating history. Raw evidence is persisted before downstream normalization
 * can be treated as durable product intelligence.
 */
export const marketRepository = {
  async startIngestionRun(input: MarketIngestionRunInput) {
    const existing = await prisma.$queryRaw<
      Array<{ id: string; status: string }>
    >(Prisma.sql`
      SELECT "id", "status"
      FROM "MarketIngestionRun"
      WHERE "sourceId" = ${input.sourceId}
        AND "idempotencyKey" = ${input.idempotencyKey}
      LIMIT 1
    `);

    if (existing[0]) return existing[0];

    const id = crypto.randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketIngestionRun" (
        "id", "sourceId", "status", "idempotencyKey", "startedAt"
      ) VALUES (
        ${id}, ${input.sourceId}, 'RUNNING', ${input.idempotencyKey}, CURRENT_TIMESTAMP
      )
    `);
    return { id, status: "RUNNING" };
  },

  async completeIngestionRun(
    runId: string,
    result: {
      status: "SUCCEEDED" | "PARTIAL" | "FAILED" | "CANCELLED";
      recordsSeen: number;
      recordsAccepted: number;
      recordsRejected: number;
      errorSummary?: Record<string, unknown>;
    },
  ) {
    if (
      result.recordsSeen < 0 ||
      result.recordsAccepted < 0 ||
      result.recordsRejected < 0 ||
      result.recordsAccepted + result.recordsRejected > result.recordsSeen
    ) {
      throw new Error("INVALID_INGESTION_COUNTS");
    }

    await prisma.$executeRaw(Prisma.sql`
      UPDATE "MarketIngestionRun"
      SET "status" = ${result.status},
          "completedAt" = CURRENT_TIMESTAMP,
          "recordsSeen" = ${result.recordsSeen},
          "recordsAccepted" = ${result.recordsAccepted},
          "recordsRejected" = ${result.recordsRejected},
          "errorSummary" = ${json(result.errorSummary)}::jsonb
      WHERE "id" = ${runId}
    `);
  },

  async persistEvidence(input: MarketEvidenceInput) {
    const id = crypto.randomUUID();
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "MarketEvidence"
      WHERE "sourceId" = ${input.sourceId}
        AND "contentHash" = ${input.contentHash ?? null}
      LIMIT 1
    `);

    if (rows[0]) return rows[0].id;

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketEvidence" (
        "id", "sourceId", "sourceProductId", "retrievedAt", "retrievalMethod",
        "locator", "contentHash", "excerpt", "metadata"
      ) VALUES (
        ${id}, ${input.sourceId}, ${input.sourceProductId ?? null}, ${input.retrievedAt},
        ${input.retrievalMethod}, ${input.locator ?? null}, ${input.contentHash ?? null},
        ${input.excerpt ?? null}, ${json(input.metadata)}::jsonb
      )
    `);

    return id;
  },

  async upsertCanonicalProduct(product: CanonicalMarketProduct) {
    const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "MarketProduct"
      WHERE "canonicalKey" = ${product.canonicalKey}
      LIMIT 1
    `);

    const productId = existing[0]?.id ?? crypto.randomUUID();
    if (existing[0]) {
      await prisma.$executeRaw(Prisma.sql`
        UPDATE "MarketProduct"
        SET "brand" = ${product.brand ?? null},
            "title" = ${product.name},
            "description" = ${product.description ?? null},
            "category" = ${product.category},
            "attributes" = ${json(product.attributes)}::jsonb,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${productId}
      `);
      return productId;
    }

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketProduct" (
        "id", "canonicalKey", "brand", "title", "description", "category",
        "attributes", "createdAt", "updatedAt"
      ) VALUES (
        ${productId}, ${product.canonicalKey}, ${product.brand ?? null}, ${product.name},
        ${product.description ?? null}, ${product.category}, ${json(product.attributes)}::jsonb,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
    return productId;
  },

  async upsertSourceProduct(input: {
    sourceId: string;
    vendorId?: string;
    productId: string;
    sourceProductId: string;
    sku?: string;
    url: string;
    titleObserved?: string;
    variant?: Record<string, unknown>;
    sourceAttributes?: Record<string, unknown>;
    seenAt: Date;
  }) {
    if (!input.url.startsWith("https://")) {
      throw new Error("MARKET_SOURCE_URL_MUST_USE_HTTPS");
    }

    const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "MarketSourceProduct"
      WHERE "sourceId" = ${input.sourceId}
        AND "sourceProductId" = ${input.sourceProductId}
      LIMIT 1
    `);

    const id = existing[0]?.id ?? crypto.randomUUID();
    if (existing[0]) {
      await prisma.$executeRaw(Prisma.sql`
        UPDATE "MarketSourceProduct"
        SET "vendorId" = ${input.vendorId ?? null},
            "sku" = ${input.sku ?? null},
            "url" = ${input.url},
            "titleObserved" = ${input.titleObserved ?? null},
            "variant" = ${json(input.variant)}::jsonb,
            "sourceAttributes" = ${json(input.sourceAttributes)}::jsonb,
            "lastSeenAt" = ${input.seenAt},
            "active" = true
        WHERE "id" = ${id}
      `);
      return id;
    }

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketSourceProduct" (
        "id", "sourceId", "vendorId", "productId", "sourceProductId", "sku", "url",
        "titleObserved", "variant", "sourceAttributes", "firstSeenAt", "lastSeenAt", "active"
      ) VALUES (
        ${id}, ${input.sourceId}, ${input.vendorId ?? null}, ${input.productId},
        ${input.sourceProductId}, ${input.sku ?? null}, ${input.url}, ${input.titleObserved ?? null},
        ${json(input.variant)}::jsonb, ${json(input.sourceAttributes)}::jsonb,
        ${input.seenAt}, ${input.seenAt}, true
      )
    `);
    return id;
  },

  async appendPriceObservation(input: MarketObservationInput) {
    assertPrice(input.amountMinor, "AMOUNT_MINOR");
    if (input.listAmountMinor !== undefined)
      assertPrice(input.listAmountMinor, "LIST_AMOUNT_MINOR");
    assertConfidence(input.confidenceBps);
    if (!input.unit.trim()) throw new Error("PRICE_UNIT_REQUIRED");
    if (input.freshUntil && input.freshUntil < input.observedAt) {
      throw new Error("FRESH_UNTIL_CANNOT_PRECEDE_OBSERVED_AT");
    }

    const id = crypto.randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketPriceObservation" (
        "id", "sourceProductId", "observedAt", "amountMinor", "listAmountMinor",
        "currency", "unit", "taxIncluded", "shippingIncluded", "installationIncluded",
        "location", "availability", "evidence", "retrievalMethod", "confidenceBps", "freshUntil"
      ) VALUES (
        ${id}, ${input.sourceProductId}, ${input.observedAt}, ${input.amountMinor},
        ${input.listAmountMinor ?? null}, 'INR', ${input.unit}, ${input.taxIncluded ?? null},
        ${input.shippingIncluded ?? null}, ${input.installationIncluded ?? null},
        ${json(input.location)}::jsonb, ${input.availability ?? null}, ${json(input.evidence)}::jsonb,
        ${input.retrievalMethod}, ${input.confidenceBps ?? null}, ${input.freshUntil ?? null}
      )
    `);
    return id;
  },

  async listPriceHistory(sourceProductId: string) {
    return prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT "id", "observedAt", "amountMinor", "listAmountMinor", "currency", "unit",
             "taxIncluded", "shippingIncluded", "installationIncluded", "location",
             "availability", "evidence", "retrievalMethod", "confidenceBps", "freshUntil"
      FROM "MarketPriceObservation"
      WHERE "sourceProductId" = ${sourceProductId}
      ORDER BY "observedAt" DESC
    `);
  },

  async addRelationship(input: {
    fromProductId: string;
    toProductId: string;
    relationshipType: string;
    confidenceBps?: number;
    evidence?: Record<string, unknown>;
  }) {
    if (input.fromProductId === input.toProductId) {
      throw new Error("MARKET_RELATIONSHIP_CANNOT_SELF_REFERENCE");
    }
    assertConfidence(input.confidenceBps);

    const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "MarketProductRelationship"
      WHERE "fromProductId" = ${input.fromProductId}
        AND "toProductId" = ${input.toProductId}
        AND "relationshipType" = ${input.relationshipType}
      LIMIT 1
    `);
    if (existing[0]) return existing[0].id;

    const id = crypto.randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "MarketProductRelationship" (
        "id", "fromProductId", "toProductId", "relationshipType", "confidenceBps", "evidence"
      ) VALUES (
        ${id}, ${input.fromProductId}, ${input.toProductId}, ${input.relationshipType},
        ${input.confidenceBps ?? null}, ${json(input.evidence)}::jsonb
      )
    `);
    return id;
  },

  // Reads for the alternative/comparison side of the pipeline - these were
  // missing entirely: relationships and price observations could be
  // written, but nothing could read them back for ranking. This is what
  // makes rankValueCandidates/rankSubstitutions (valueEngine.ts,
  // substitution.ts) actually usable against real data instead of only
  // unit-tested against hand-built fixtures.
  async listRelationshipsForProduct(
    productId: string,
    relationshipType?: string,
  ) {
    return prisma.$queryRaw<
      Array<{
        id: string;
        toProductId: string;
        relationshipType: string;
        confidenceBps: number | null;
        evidence: unknown;
        title: string;
        category: string;
      }>
    >(Prisma.sql`
      SELECT r."id", r."toProductId", r."relationshipType", r."confidenceBps", r."evidence",
             p."title", p."category"
      FROM "MarketProductRelationship" r
      JOIN "MarketProduct" p ON p."id" = r."toProductId"
      WHERE r."fromProductId" = ${productId}
        ${relationshipType ? Prisma.sql`AND r."relationshipType" = ${relationshipType}` : Prisma.empty}
      ORDER BY r."confidenceBps" DESC NULLS LAST
    `);
  },

  // Latest active source-product listing (one per source/vendor) plus its
  // most recent price observation, for every product in a category - the
  // candidate set More/Better Options and value ranking need to compare
  // against, rather than a single product's history in isolation.
  async listActiveCandidatesByCategory(category: string) {
    return prisma.$queryRaw<
      Array<{
        sourceProductId: string;
        productId: string;
        title: string;
        amountMinor: bigint | null;
        confidenceBps: number | null;
        observedAt: Date | null;
      }>
    >(Prisma.sql`
      SELECT sp."id" AS "sourceProductId", sp."productId", p."title",
             latest."amountMinor", latest."confidenceBps", latest."observedAt"
      FROM "MarketSourceProduct" sp
      JOIN "MarketProduct" p ON p."id" = sp."productId"
      LEFT JOIN LATERAL (
        SELECT "amountMinor", "confidenceBps", "observedAt"
        FROM "MarketPriceObservation" po
        WHERE po."sourceProductId" = sp."id"
        ORDER BY po."observedAt" DESC
        LIMIT 1
      ) latest ON true
      WHERE sp."active" = true AND p."category" = ${category}
    `);
  },
};
