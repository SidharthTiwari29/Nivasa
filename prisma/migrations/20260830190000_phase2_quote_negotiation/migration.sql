-- CreateEnum
CREATE TYPE "NegotiationDecision" AS ENUM ('ACCEPTED', 'COUNTERED', 'REJECTED');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "nivasaCommissionBps" INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE "Quote" ADD COLUMN "minMarginBps" INTEGER NOT NULL DEFAULT 500;

-- CreateTable
CREATE TABLE "QuoteNegotiation" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "proposedAmountMinor" BIGINT NOT NULL,
    "decision" "NegotiationDecision" NOT NULL,
    "counterAmountMinor" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteNegotiation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteNegotiation_quoteId_createdAt_idx" ON "QuoteNegotiation"("quoteId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuoteNegotiation" ADD CONSTRAINT "QuoteNegotiation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
