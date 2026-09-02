-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('INFERRED', 'RECOMMENDED', 'COMMITTED', 'LOCKED');

-- CreateTable
CREATE TABLE "CurationRecommendation" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "targetBudgetMinor" BIGINT NOT NULL,
    "selections" JSONB NOT NULL,
    "totalMinor" BIGINT NOT NULL,
    "resultingBoqId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committedAt" TIMESTAMP(3),

    CONSTRAINT "CurationRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurationRecommendation_projectId_status_idx" ON "CurationRecommendation"("projectId", "status");

-- AddForeignKey
ALTER TABLE "CurationRecommendation" ADD CONSTRAINT "CurationRecommendation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurationRecommendation" ADD CONSTRAINT "CurationRecommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
