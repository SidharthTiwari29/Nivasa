import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  roomUnderstandingParamSchema,
  roomUnderstandingSchema,
} from "@/server/validators/homeIntelligence";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";

type RouteParams = { params: Promise<{ propertyId: string; roomId: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const parsed = parseOrThrow(roomUnderstandingParamSchema, await params);
    const versions = await homeIntelligenceService.listRoomUnderstandings(
      parsed.propertyId,
      parsed.roomId,
      userId,
    );
    return NextResponse.json({ versions });
  },
);

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const parsed = parseOrThrow(roomUnderstandingParamSchema, await params);
    const body = parseOrThrow(roomUnderstandingSchema, await request.json());
    const understanding = await homeIntelligenceService.upsertRoomUnderstanding(
      parsed.propertyId,
      parsed.roomId,
      userId,
      body,
    );
    return NextResponse.json({ understanding }, { status: 201 });
  },
);
