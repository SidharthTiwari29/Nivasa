-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'VILLA', 'OTHER');

-- AlterTable
ALTER TABLE "Property"
  ADD COLUMN "city" TEXT,
  ADD COLUMN "propertyType" "PropertyType",
  ADD COLUMN "targetBudgetMinor" BIGINT;
