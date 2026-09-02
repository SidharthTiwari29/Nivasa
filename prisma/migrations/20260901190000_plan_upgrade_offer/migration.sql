-- CreateTable
CREATE TABLE "PlanUpgradeOffer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetPackageCode" TEXT NOT NULL,
    "visitNumber" INTEGER NOT NULL DEFAULT 1,
    "offerShownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanUpgradeOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanUpgradeOffer_userId_targetPackageCode_key" ON "PlanUpgradeOffer"("userId", "targetPackageCode");

-- AddForeignKey
ALTER TABLE "PlanUpgradeOffer" ADD CONSTRAINT "PlanUpgradeOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
