import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { budgetTimelineService } from "@/server/services/budgetTimelineService";

const paramsSchema = z.object({ id: z.string() });

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    const timeline = await budgetTimelineService.getTimeline(id, userId);
    return NextResponse.json({ timeline });
  },
);
