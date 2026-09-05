import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { rejectObservation } from "@/server/services/floorPlanAnalysisService";

const paramsSchema = z.object({ id: z.string().cuid() });

type RouteParams = { params: Promise<{ id: string }> };

// The real, explicit counterpart to the match route - a human decision
// that this observation does not correspond to any real room.
export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    await rejectObservation(id, userId);
    return NextResponse.json({ rejected: true });
  },
);
