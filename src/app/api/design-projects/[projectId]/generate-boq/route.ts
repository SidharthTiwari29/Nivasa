import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { designBoqGenerationService } from "@/server/services/designBoqGenerationService";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const bodySchema = z.object({
  targetBudgetMinor: z.number().int().positive(),
});

type RouteParams = { params: Promise<{ projectId: string }> };

// This produces a RECOMMENDATION, not an already-committed BOQ - the
// customer still reviews and explicitly commits it (the existing
// /api/catalogue/recommend/{id}/commit endpoint), matching the canonical
// inferred -> recommended -> committed lifecycle. Generating a design's
// real cost is not the same as spending it.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const { targetBudgetMinor } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const recommendation = await designBoqGenerationService.generateForProject(
      projectId,
      userId,
      BigInt(targetBudgetMinor),
    );
    return NextResponse.json({ recommendation }, { status: 201 });
  },
);
