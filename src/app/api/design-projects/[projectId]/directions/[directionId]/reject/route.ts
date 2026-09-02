import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { designDirectionService } from "@/server/services/designDirectionService";

const paramsSchema = z.object({
  projectId: z.string().min(1),
  directionId: z.string().min(1),
});
const bodySchema = z.object({ reason: z.string().trim().max(2000).optional() });

type RouteParams = {
  params: Promise<{ projectId: string; directionId: string }>;
};

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId, directionId } = parseOrThrow(paramsSchema, await params);
    const { reason } = parseOrThrow(bodySchema, await request.json());
    const direction = await designDirectionService.rejectDirection(
      projectId,
      directionId,
      userId,
      reason,
    );
    return NextResponse.json({ direction });
  },
);
