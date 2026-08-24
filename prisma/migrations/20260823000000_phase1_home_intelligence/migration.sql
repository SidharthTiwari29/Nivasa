-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "RoomUnderstandingSource" AS ENUM ('AI', 'USER', 'IMPORTED');

-- CreateEnum
CREATE TYPE "RoomUnderstandingStatus" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'CORRECTED', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "HomeIntelligence" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "propertyType" "PropertyType" NOT NULL,
    "configuration" TEXT,
    "possessionDate" TIMESTAMP(3),
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "carpetAreaSqFt" DECIMAL(12,2),
    "metadata" JSONB,
    "confirmedAt" TIMESTAMP(3),
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeDnaVersion" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "homeIntelligenceVersion" INTEGER NOT NULL,
    "household" JSONB NOT NULL,
    "lifestyle" JSONB NOT NULL,
    "designPersonality" JSONB NOT NULL,
    "storageNeeds" JSONB NOT NULL,
    "functionalNeeds" JSONB NOT NULL,
    "futureNeeds" JSONB NOT NULL,
    "smartHomePreferences" JSONB NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en-IN',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeDnaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomUnderstanding" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "name" TEXT NOT NULL,
    "confidenceBps" INTEGER,
    "source" "RoomUnderstandingSource" NOT NULL,
    "geometry" JSONB,
    "dimensions" JSONB,
    "constraints" JSONB,
    "requirements" JSONB,
    "status" "RoomUnderstandingStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "confirmedAt" TIMESTAMP(3),
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomUnderstanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeIntelligence_propertyId_key" ON "HomeIntelligence"("propertyId");
CREATE INDEX "HomeIntelligence_confirmedByUserId_idx" ON "HomeIntelligence"("confirmedByUserId");
CREATE UNIQUE INDEX "HomeDnaVersion_propertyId_version_key" ON "HomeDnaVersion"("propertyId", "version");
CREATE INDEX "HomeDnaVersion_propertyId_createdAt_idx" ON "HomeDnaVersion"("propertyId", "createdAt");
CREATE INDEX "HomeDnaVersion_createdByUserId_idx" ON "HomeDnaVersion"("createdByUserId");
CREATE UNIQUE INDEX "RoomUnderstanding_roomId_version_key" ON "RoomUnderstanding"("roomId", "version");
CREATE INDEX "RoomUnderstanding_roomId_createdAt_idx" ON "RoomUnderstanding"("roomId", "createdAt");
CREATE INDEX "RoomUnderstanding_confirmedByUserId_idx" ON "RoomUnderstanding"("confirmedByUserId");

-- AddForeignKey
ALTER TABLE "HomeIntelligence" ADD CONSTRAINT "HomeIntelligence_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomeIntelligence" ADD CONSTRAINT "HomeIntelligence_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomeDnaVersion" ADD CONSTRAINT "HomeDnaVersion_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomeDnaVersion" ADD CONSTRAINT "HomeDnaVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "RoomUnderstanding" ADD CONSTRAINT "RoomUnderstanding_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoomUnderstanding" ADD CONSTRAINT "RoomUnderstanding_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
