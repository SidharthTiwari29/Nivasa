-- CreateEnum
CREATE TYPE "PropertyBhkType" AS ENUM ('ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'VILLA', 'OTHER');

-- AlterTable
ALTER TABLE "Property"
  ADD COLUMN "city" TEXT,
  ADD COLUMN "propertyType" "PropertyBhkType",
  ADD COLUMN "targetBudgetMinor" BIGINT;
