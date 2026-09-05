-- AlterTable
ALTER TABLE "FloorPlanObservation"
  ADD COLUMN "sourceRegion" JSONB,
  ADD COLUMN "rejected" BOOLEAN NOT NULL DEFAULT false;
