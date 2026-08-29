-- Phase 1 Step 2: production market/product intelligence foundation.
-- This migration is intentionally additive and keeps mutable catalogue observations
-- separate from immutable budget versions.

CREATE TABLE "MarketSource" (
  "id" TEXT NOT NULL,
  "canonicalName" TEXT NOT NULL,
  "domain" TEXT,
  "sourceType" TEXT NOT NULL,
  "geographies" JSONB,
  "categories" JSONB NOT NULL,
  "acquisitionMethod" TEXT NOT NULL,
  "accessStatus" TEXT NOT NULL,
  "termsReference" TEXT,
  "licensingStatus" TEXT,
  "ingestionEligible" BOOLEAN NOT NULL DEFAULT false,
  "freshnessPolicyHours" INTEGER,
  "provenancePolicy" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketSource_canonicalName_key" ON "MarketSource"("canonicalName");
CREATE INDEX "MarketSource_sourceType_active_idx" ON "MarketSource"("sourceType", "active");

CREATE TABLE "MarketVendor" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "canonicalName" TEXT NOT NULL,
  "brandName" TEXT,
  "sellerType" TEXT NOT NULL,
  "sellerReference" TEXT,
  "geography" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketVendor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketVendor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketVendor_sourceId_canonicalName_key" ON "MarketVendor"("sourceId", "canonicalName");
CREATE INDEX "MarketVendor_canonicalName_idx" ON "MarketVendor"("canonicalName");

CREATE TABLE "MarketProduct" (
  "id" TEXT NOT NULL,
  "canonicalKey" TEXT NOT NULL,
  "brand" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "dimensions" JSONB,
  "material" TEXT,
  "finish" TEXT,
  "configuration" JSONB,
  "customization" JSONB,
  "media" JSONB,
  "attributes" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketProduct_canonicalKey_key" ON "MarketProduct"("canonicalKey");
CREATE INDEX "MarketProduct_category_subcategory_idx" ON "MarketProduct"("category", "subcategory");
CREATE INDEX "MarketProduct_brand_idx" ON "MarketProduct"("brand");

CREATE TABLE "MarketSourceProduct" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "vendorId" TEXT,
  "productId" TEXT NOT NULL,
  "sourceProductId" TEXT NOT NULL,
  "sku" TEXT,
  "url" TEXT,
  "titleObserved" TEXT,
  "variant" JSONB,
  "sourceAttributes" JSONB,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "MarketSourceProduct_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketSourceProduct_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MarketSourceProduct_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "MarketVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "MarketSourceProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MarketProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketSourceProduct_sourceId_sourceProductId_key" ON "MarketSourceProduct"("sourceId", "sourceProductId");
CREATE INDEX "MarketSourceProduct_productId_idx" ON "MarketSourceProduct"("productId");
CREATE INDEX "MarketSourceProduct_vendorId_idx" ON "MarketSourceProduct"("vendorId");

CREATE TABLE "MarketPriceObservation" (
  "id" TEXT NOT NULL,
  "sourceProductId" TEXT NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "amountMinor" BIGINT NOT NULL,
  "listAmountMinor" BIGINT,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "unit" TEXT NOT NULL,
  "taxIncluded" BOOLEAN,
  "shippingIncluded" BOOLEAN,
  "installationIncluded" BOOLEAN,
  "location" JSONB,
  "availability" TEXT,
  "evidence" JSONB NOT NULL,
  "retrievalMethod" TEXT NOT NULL,
  "confidenceBps" INTEGER,
  "freshUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketPriceObservation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketPriceObservation_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "MarketSourceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MarketPriceObservation_sourceProductId_observedAt_idx" ON "MarketPriceObservation"("sourceProductId", "observedAt");
CREATE INDEX "MarketPriceObservation_observedAt_idx" ON "MarketPriceObservation"("observedAt");
CREATE INDEX "MarketPriceObservation_amountMinor_idx" ON "MarketPriceObservation"("amountMinor");

CREATE TABLE "MarketProductRelationship" (
  "id" TEXT NOT NULL,
  "fromProductId" TEXT NOT NULL,
  "toProductId" TEXT NOT NULL,
  "relationshipType" TEXT NOT NULL,
  "confidenceBps" INTEGER,
  "evidence" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketProductRelationship_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketProductRelationship_fromProductId_fkey" FOREIGN KEY ("fromProductId") REFERENCES "MarketProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MarketProductRelationship_toProductId_fkey" FOREIGN KEY ("toProductId") REFERENCES "MarketProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketProductRelationship_fromProductId_toProductId_relationshipType_key" ON "MarketProductRelationship"("fromProductId", "toProductId", "relationshipType");
CREATE INDEX "MarketProductRelationship_fromProductId_relationshipType_idx" ON "MarketProductRelationship"("fromProductId", "relationshipType");

CREATE TABLE "MarketIngestionRun" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "recordsSeen" INTEGER NOT NULL DEFAULT 0,
  "recordsAccepted" INTEGER NOT NULL DEFAULT 0,
  "recordsRejected" INTEGER NOT NULL DEFAULT 0,
  "errorSummary" JSONB,
  CONSTRAINT "MarketIngestionRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketIngestionRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketIngestionRun_sourceId_idempotencyKey_key" ON "MarketIngestionRun"("sourceId", "idempotencyKey");
CREATE INDEX "MarketIngestionRun_sourceId_startedAt_idx" ON "MarketIngestionRun"("sourceId", "startedAt");

CREATE TABLE "MarketEvidence" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "sourceProductId" TEXT,
  "retrievedAt" TIMESTAMP(3) NOT NULL,
  "retrievalMethod" TEXT NOT NULL,
  "locator" TEXT,
  "contentHash" TEXT,
  "excerpt" TEXT,
  "metadata" JSONB,
  CONSTRAINT "MarketEvidence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MarketEvidence_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "MarketSourceProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "MarketEvidence_sourceId_retrievedAt_idx" ON "MarketEvidence"("sourceId", "retrievedAt");
CREATE INDEX "MarketEvidence_sourceProductId_idx" ON "MarketEvidence"("sourceProductId");
