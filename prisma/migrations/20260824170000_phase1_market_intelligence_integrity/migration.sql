-- Phase 1 Step 2: production integrity hardening.
-- Keep source/product evidence auditable and prevent impossible price states.

ALTER TABLE "MarketSource"
  ADD CONSTRAINT "MarketSource_accessStatus_check"
    CHECK ("accessStatus" IN ('UNKNOWN', 'REVIEW_REQUIRED', 'APPROVED', 'BLOCKED', 'EXPIRED')),
  ADD CONSTRAINT "MarketSource_ingestionEligibility_check"
    CHECK (NOT "ingestionEligible" OR "accessStatus" = 'APPROVED');

ALTER TABLE "MarketPriceObservation"
  ADD CONSTRAINT "MarketPriceObservation_amount_check"
    CHECK ("amountMinor" >= 0),
  ADD CONSTRAINT "MarketPriceObservation_listAmount_check"
    CHECK ("listAmountMinor" IS NULL OR "listAmountMinor" >= 0),
  ADD CONSTRAINT "MarketPriceObservation_confidence_check"
    CHECK ("confidenceBps" IS NULL OR ("confidenceBps" >= 0 AND "confidenceBps" <= 10000)),
  ADD CONSTRAINT "MarketPriceObservation_currency_check"
    CHECK ("currency" = 'INR'),
  ADD CONSTRAINT "MarketPriceObservation_unit_check"
    CHECK (length(trim("unit")) > 0),
  ADD CONSTRAINT "MarketPriceObservation_freshness_check"
    CHECK ("freshUntil" IS NULL OR "freshUntil" >= "observedAt");

ALTER TABLE "MarketProductRelationship"
  ADD CONSTRAINT "MarketProductRelationship_not_self_check"
    CHECK ("fromProductId" <> "toProductId"),
  ADD CONSTRAINT "MarketProductRelationship_confidence_check"
    CHECK ("confidenceBps" IS NULL OR ("confidenceBps" >= 0 AND "confidenceBps" <= 10000));

ALTER TABLE "MarketIngestionRun"
  ADD CONSTRAINT "MarketIngestionRun_status_check"
    CHECK ("status" IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED', 'CANCELLED')),
  ADD CONSTRAINT "MarketIngestionRun_counts_check"
    CHECK (
      "recordsSeen" >= 0
      AND "recordsAccepted" >= 0
      AND "recordsRejected" >= 0
      AND "recordsAccepted" + "recordsRejected" <= "recordsSeen"
    );

CREATE INDEX "MarketPriceObservation_freshUntil_idx"
  ON "MarketPriceObservation"("freshUntil");

CREATE INDEX "MarketSource_ingestionEligible_active_idx"
  ON "MarketSource"("ingestionEligible", "active");

CREATE UNIQUE INDEX "MarketEvidence_source_contentHash_key"
  ON "MarketEvidence"("sourceId", "contentHash")
  WHERE "contentHash" IS NOT NULL;
