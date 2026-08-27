ALTER TABLE "BudgetLine"
ADD COLUMN "catalogueItemId" TEXT;

CREATE INDEX "BudgetLine_catalogueItemId_idx" ON "BudgetLine"("catalogueItemId");

ALTER TABLE "BudgetLine"
ADD CONSTRAINT "BudgetLine_catalogueItemId_fkey"
FOREIGN KEY ("catalogueItemId") REFERENCES "CatalogueItem"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
