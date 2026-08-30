-- CreateEnum
CREATE TYPE "SubstitutionImpact" AS ENUM ('IMPROVED', 'SAME', 'REDUCED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProcurementRequestStatus" AS ENUM ('DRAFT', 'RFQ_SENT', 'QUOTES_RECEIVED', 'ORDERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SNAGGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS_CHANGED', 'QUOTE_RECEIVED', 'EXECUTION_STATUS_CHANGED', 'BUDGET_LOCKED', 'GENERAL');

-- CreateTable
CREATE TABLE "CatalogueSubstitution" (
    "id" TEXT NOT NULL,
    "fromCatalogueItemId" TEXT NOT NULL,
    "toCatalogueItemId" TEXT NOT NULL,
    "qualityImpact" "SubstitutionImpact" NOT NULL DEFAULT 'UNKNOWN',
    "maintenanceImpact" "SubstitutionImpact" NOT NULL DEFAULT 'UNKNOWN',
    "appearanceImpact" "SubstitutionImpact" NOT NULL DEFAULT 'UNKNOWN',
    "durabilityImpact" "SubstitutionImpact" NOT NULL DEFAULT 'UNKNOWN',
    "explanation" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogueSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "lockedBudgetPlanId" TEXT NOT NULL,
    "lockedBudgetVersion" INTEGER NOT NULL,
    "status" "ProcurementRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "totalAmountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "QuoteStatus" NOT NULL DEFAULT 'SUBMITTED',
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "totalAmountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "snagNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueSubstitution_fromCatalogueItemId_toCatalogueItemId_key" ON "CatalogueSubstitution"("fromCatalogueItemId", "toCatalogueItemId");

-- CreateIndex
CREATE INDEX "CatalogueSubstitution_fromCatalogueItemId_idx" ON "CatalogueSubstitution"("fromCatalogueItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementRequest_propertyId_idempotencyKey_key" ON "ProcurementRequest"("propertyId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "Quote_procurementRequestId_status_idx" ON "Quote"("procurementRequestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");

-- CreateIndex
CREATE INDEX "Order_procurementRequestId_idx" ON "Order"("procurementRequestId");

-- CreateIndex
CREATE INDEX "ExecutionRecord_orderId_idx" ON "ExecutionRecord"("orderId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- AddForeignKey
ALTER TABLE "CatalogueSubstitution" ADD CONSTRAINT "CatalogueSubstitution_fromCatalogueItemId_fkey" FOREIGN KEY ("fromCatalogueItemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueSubstitution" ADD CONSTRAINT "CatalogueSubstitution_toCatalogueItemId_fkey" FOREIGN KEY ("toCatalogueItemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueSubstitution" ADD CONSTRAINT "CatalogueSubstitution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementRequest" ADD CONSTRAINT "ProcurementRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementRequest" ADD CONSTRAINT "ProcurementRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionRecord" ADD CONSTRAINT "ExecutionRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
