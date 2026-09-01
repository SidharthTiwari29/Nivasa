-- CreateTable
CREATE TABLE "OnboardingRenderGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingRenderGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRenderGrant_userId_key" ON "OnboardingRenderGrant"("userId");

-- AddForeignKey
ALTER TABLE "OnboardingRenderGrant" ADD CONSTRAINT "OnboardingRenderGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
