-- CreateEnum
CREATE TYPE "DesignDirectionStatus" AS ENUM ('ACTIVE', 'ALTERNATIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "DesignDirection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DesignDirectionStatus" NOT NULL DEFAULT 'ALTERNATIVE',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "DesignDirection_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "DesignVersion" ADD COLUMN "directionId" TEXT;

-- CreateIndex
CREATE INDEX "DesignDirection_projectId_status_idx" ON "DesignDirection"("projectId", "status");

-- CreateIndex
CREATE INDEX "DesignVersion_directionId_idx" ON "DesignVersion"("directionId");

-- AddForeignKey
ALTER TABLE "DesignDirection" ADD CONSTRAINT "DesignDirection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignVersion" ADD CONSTRAINT "DesignVersion_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "DesignDirection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
