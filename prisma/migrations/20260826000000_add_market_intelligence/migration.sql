CREATE TYPE "IntelligenceSourceKind" AS ENUM ('MANUFACTURER', 'BRAND', 'RETAILER', 'MARKETPLACE', 'DEALER', 'DISTRIBUTOR', 'LOCAL_SUPPLIER', 'SERVICE_PROVIDER');

CREATE TYPE "IntelligenceTruthClass" AS ENUM ('VERIFIED', 'ESTIMATED', 'INFERRED', 'UNKNOWN');

CREATE TABLE "IntelligenceSource" (
    "id" TEXT NOT NULL,
    "kind" "IntelligenceSourceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntelligenceSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntelligenceEvidence" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "uri" TEXT,
    "excerpt" TEXT,
    "truth" "IntelligenceTruthClass" NOT NULL DEFAULT 'UNKNOWN',
    "confidenceBps" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "IntelligenceEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonicalProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CanonicalProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "sku" TEXT,
    "attributes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketObservation" (
    "id" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "variantId" TEXT,
    "sourceId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "geography" TEXT,
    "confidenceBps" INTEGER NOT NULL,
    "truth" "IntelligenceTruthClass" NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketObservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogueItemIdentity" (
    "id" TEXT NOT NULL,
    "catalogueItemId" TEXT NOT NULL,
    "canonicalProductId" TEXT NOT NULL,
    "matchConfidenceBps" INTEGER NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CatalogueItemIdentity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntelligenceSource_kind_active_idx" ON "IntelligenceSource"("kind", "active");
CREATE INDEX "IntelligenceSource_name_idx" ON "IntelligenceSource"("name");
CREATE INDEX "IntelligenceEvidence_sourceId_observedAt_idx" ON "IntelligenceEvidence"("sourceId", "observedAt");
CREATE INDEX "IntelligenceEvidence_truth_confidenceBps_idx" ON "IntelligenceEvidence"("truth", "confidenceBps");
CREATE INDEX "CanonicalProduct_category_brand_idx" ON "CanonicalProduct"("category", "brand");
CREATE INDEX "CanonicalProduct_name_idx" ON "CanonicalProduct"("name");
CREATE INDEX "ProductVariant_canonicalProductId_idx" ON "ProductVariant"("canonicalProductId");
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");
CREATE INDEX "MarketObservation_canonicalProductId_observedAt_idx" ON "MarketObservation"("canonicalProductId", "observedAt");
CREATE INDEX "MarketObservation_variantId_observedAt_idx" ON "MarketObservation"("variantId", "observedAt");
CREATE INDEX "MarketObservation_sourceId_observedAt_idx" ON "MarketObservation"("sourceId", "observedAt");
CREATE INDEX "MarketObservation_geography_available_idx" ON "MarketObservation"("geography", "available");
CREATE UNIQUE INDEX "CatalogueItemIdentity_catalogueItemId_canonicalProductId_key" ON "CatalogueItemIdentity"("catalogueItemId", "canonicalProductId");
CREATE INDEX "CatalogueItemIdentity_canonicalProductId_matchConfidenceBps_idx" ON "CatalogueItemIdentity"("canonicalProductId", "matchConfidenceBps");

ALTER TABLE "IntelligenceEvidence" ADD CONSTRAINT "IntelligenceEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketObservation" ADD CONSTRAINT "MarketObservation_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketObservation" ADD CONSTRAINT "MarketObservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketObservation" ADD CONSTRAINT "MarketObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketObservation" ADD CONSTRAINT "MarketObservation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "IntelligenceEvidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CatalogueItemIdentity" ADD CONSTRAINT "CatalogueItemIdentity_catalogueItemId_fkey" FOREIGN KEY ("catalogueItemId") REFERENCES "CatalogueItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogueItemIdentity" ADD CONSTRAINT "CatalogueItemIdentity_canonicalProductId_fkey" FOREIGN KEY ("canonicalProductId") REFERENCES "CanonicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
