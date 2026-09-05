-- AlterTable
ALTER TABLE "Asset"
  ADD COLUMN "propertyId" TEXT;

-- CreateIndex
CREATE INDEX "Asset_propertyId_idx" ON "Asset"("propertyId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
