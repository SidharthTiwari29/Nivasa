import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueCurationService } from "@/server/services/catalogueCurationService";

const paramsSchema = z.object({ recommendationId: z.string().min(1) });

type RouteParams = { params: Promise<{ recommendationId: string }> };

export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { recommendationId } = parseOrThrow(paramsSchema, await params);
    const boq = await catalogueCurationService.commit(recommendationId, userId);
    return NextResponse.json({ boq }, { status: 201 });
  },
);
