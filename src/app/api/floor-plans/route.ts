import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createFloorPlanSchema } from "@/server/validators/floorPlan";
import { floorPlanService } from "@/server/services/floorPlanService";

export const GET = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const propertyId = new URL(request.url).searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "propertyId is required" } },
      { status: 422 },
    );
  }
  const floorPlans = await floorPlanService.list(propertyId, userId);
  return NextResponse.json({ floorPlans });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const body = parseOrThrow(createFloorPlanSchema, await request.json());
  const floorPlan = await floorPlanService.create(userId, body);
  return NextResponse.json({ floorPlan }, { status: 201 });
});
