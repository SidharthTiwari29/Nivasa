-- CreateTable
CREATE TABLE "SupplierInvite" (
    "id" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "quoteId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierInvite_tokenHash_key" ON "SupplierInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "SupplierInvite_procurementRequestId_idx" ON "SupplierInvite"("procurementRequestId");

-- AddForeignKey
ALTER TABLE "SupplierInvite" ADD CONSTRAINT "SupplierInvite_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvite" ADD CONSTRAINT "SupplierInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
