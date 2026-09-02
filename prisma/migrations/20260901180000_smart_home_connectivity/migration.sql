-- CreateEnum
CREATE TYPE "SmartHomeConnectivity" AS ENUM ('BLUETOOTH', 'WIFI', 'ZIGBEE', 'MATTER', 'NONE');

-- AlterTable
ALTER TABLE "CatalogueItem"
  ADD COLUMN "smartHomeConnectivity" "SmartHomeConnectivity",
  ADD COLUMN "energyRatingStars" INTEGER;
