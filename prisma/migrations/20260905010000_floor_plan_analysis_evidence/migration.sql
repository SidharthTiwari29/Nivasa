-- CreateEnum
CREATE TYPE "FloorPlanAnalysisStatus" AS ENUM ('PENDING', 'ANALYZED', 'NOT_AVAILABLE', 'FAILED');

-- CreateTable
CREATE TABLE "FloorPlanAnalysis" (
    "id" TEXT NOT NULL,
    "floorPlanId" TEXT NOT NULL,
    "status" "FloorPlanAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "parserVersion" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "FloorPlanAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloorPlanObservation" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "roomLabel" TEXT NOT NULL,
    "confidenceBps" INTEGER,
    "dimensions" JSONB,
    "matchedRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloorPlanObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FloorPlanAnalysis_floorPlanId_idx" ON "FloorPlanAnalysis"("floorPlanId");

-- CreateIndex
CREATE INDEX "FloorPlanObservation_analysisId_idx" ON "FloorPlanObservation"("analysisId");

-- CreateIndex
CREATE INDEX "FloorPlanObservation_matchedRoomId_idx" ON "FloorPlanObservation"("matchedRoomId");

-- AddForeignKey
ALTER TABLE "FloorPlanAnalysis" ADD CONSTRAINT "FloorPlanAnalysis_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorPlanObservation" ADD CONSTRAINT "FloorPlanObservation_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "FloorPlanAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorPlanObservation" ADD CONSTRAINT "FloorPlanObservation_matchedRoomId_fkey" FOREIGN KEY ("matchedRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
