import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { reconcileBoqWithBudget } from "@/server/services/boqBudgetIntegration";

const paramsSchema = z.object({
  projectId: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

type RouteParams = {
  params: Promise<{ projectId: string; version: string }>;
};

// The explicit, manual path - a curated design's commit already
// triggers this automatically (see catalogueCurationService.commit),
// but a customer whose BOQ was created outside curation (a real,
// legitimate case) can request reconciliation directly.
export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId, version } = parseOrThrow(paramsSchema, await params);
    const impact = await reconcileBoqWithBudget({
      ownerId: userId,
      projectId,
      boqVersion: version,
    });
    return NextResponse.json({ impact });
  },
);
