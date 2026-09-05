import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { matchObservationToRoom } from "@/server/services/floorPlanAnalysisService";

const paramsSchema = z.object({ id: z.string().cuid() });
const bodySchema = z.object({ roomId: z.string().cuid() });

type RouteParams = { params: Promise<{ id: string }> };

// Real, explicit human confirmation - an AI-detected observation only
// becomes usable evidence for a specific real room via this deliberate
// action, never an automatic match.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    const { roomId } = parseOrThrow(bodySchema, await request.json());
    await matchObservationToRoom(id, roomId, userId);
    return NextResponse.json({ matched: true });
  },
);
