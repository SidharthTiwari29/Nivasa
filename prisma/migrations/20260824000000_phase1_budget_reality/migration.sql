CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'LOCKED');
CREATE TYPE "BudgetTruth" AS ENUM ('ESTIMATE', 'VERIFIED', 'RECOMMENDATION');

CREATE TABLE "BudgetPlan" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "lockedVersion" INTEGER,
    "lockedAt" TIMESTAMP(3),
    "lockedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetVersion" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "homeIntelligenceVersion" INTEGER,
    "homeDnaVersion" INTEGER,
    "totalLowMinor" BIGINT NOT NULL,
    "totalTargetMinor" BIGINT NOT NULL,
    "totalHighMinor" BIGINT NOT NULL,
    "contingencyMinor" BIGINT NOT NULL DEFAULT 0,
    "truth" "BudgetTruth" NOT NULL,
    "scope" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "sourceReferences" JSONB NOT NULL DEFAULT '[]',
    "createdByUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetVersionId" TEXT NOT NULL,
    "roomId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "lowMinor" BIGINT NOT NULL,
    "targetMinor" BIGINT NOT NULL,
    "highMinor" BIGINT NOT NULL,
    "truth" "BudgetTruth" NOT NULL,
    "basis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetImpact" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "baseVersion" INTEGER NOT NULL,
    "proposedLowDeltaMinor" BIGINT NOT NULL,
    "proposedTargetDeltaMinor" BIGINT NOT NULL,
    "proposedHighDeltaMinor" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetImpact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BudgetPlan_propertyId_key" ON "BudgetPlan"("propertyId");
CREATE INDEX "BudgetPlan_ownerId_updatedAt_idx" ON "BudgetPlan"("ownerId", "updatedAt");
CREATE UNIQUE INDEX "BudgetVersion_planId_version_key" ON "BudgetVersion"("planId", "version");
CREATE UNIQUE INDEX "BudgetVersion_planId_idempotencyKey_key" ON "BudgetVersion"("planId", "idempotencyKey");
CREATE INDEX "BudgetVersion_planId_createdAt_idx" ON "BudgetVersion"("planId", "createdAt");
CREATE INDEX "BudgetVersion_createdByUserId_idx" ON "BudgetVersion"("createdByUserId");
CREATE INDEX "BudgetLine_budgetVersionId_idx" ON "BudgetLine"("budgetVersionId");
CREATE INDEX "BudgetLine_roomId_idx" ON "BudgetLine"("roomId");
CREATE INDEX "BudgetImpact_planId_createdAt_idx" ON "BudgetImpact"("planId", "createdAt");

ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BudgetVersion" ADD CONSTRAINT "BudgetVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetVersion" ADD CONSTRAINT "BudgetVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetVersionId_fkey" FOREIGN KEY ("budgetVersionId") REFERENCES "BudgetVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BudgetImpact" ADD CONSTRAINT "BudgetImpact_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
