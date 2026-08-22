import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { floorPlanIdParamSchema } from "@/server/validators/floorPlan";
import { floorPlanService } from "@/server/services/floorPlanService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(floorPlanIdParamSchema, await params);
    const floorPlan = await floorPlanService.get(id, userId);
    return NextResponse.json({ floorPlan });
  },
);
