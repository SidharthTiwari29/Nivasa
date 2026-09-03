-- CreateEnum
CREATE TYPE "CatalogueAvailability" AS ENUM ('IN_STOCK', 'LIMITED_STOCK', 'OUT_OF_STOCK', 'UNKNOWN');

-- AlterTable
ALTER TABLE "CataloguePrice"
  ADD COLUMN "availability" "CatalogueAvailability" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "verifiedByUserId" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "CataloguePrice" ADD CONSTRAINT "CataloguePrice_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
