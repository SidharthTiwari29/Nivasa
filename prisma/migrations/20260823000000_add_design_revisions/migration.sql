CREATE TABLE "DesignRevision" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "baseVersionId" TEXT NOT NULL,
  "revisionNumber" INTEGER NOT NULL,
  "instruction" TEXT NOT NULL,
  "parameters" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DesignRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DesignRevision_projectId_revisionNumber_key" ON "DesignRevision"("projectId", "revisionNumber");
CREATE INDEX "DesignRevision_projectId_createdAt_idx" ON "DesignRevision"("projectId", "createdAt");

ALTER TABLE "DesignRevision" ADD CONSTRAINT "DesignRevision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DesignProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
