import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { analyzeFloorPlan } from "@/server/services/floorPlanAnalysisService";

const paramsSchema = z.object({ id: z.string().cuid() });

type RouteParams = { params: Promise<{ id: string }> };

// Real, honest endpoint - persists a real FloorPlanAnalysis with real,
// evidence-backed FloorPlanObservation rows once a real AI provider is
// configured, or a clear, real NOT_AVAILABLE record today. Never
// returns fabricated observations to make the feature look more
// finished than it is.
export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    const result = await analyzeFloorPlan(id, userId);
    return NextResponse.json({ result });
  },
);
