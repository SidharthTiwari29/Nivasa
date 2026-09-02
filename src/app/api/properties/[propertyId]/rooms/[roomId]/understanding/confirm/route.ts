import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { confirmRoomUnderstandingParamSchema } from "@/server/validators/homeIntelligence";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";

type RouteParams = { params: Promise<{ propertyId: string; roomId: string }> };

// The real, human-only confirm action: distinct from the general
// understanding upsert route (which accepts a full spatial payload). This
// endpoint takes no body at all - confirmation is a pure decision, not a
// data submission, and confirms whatever the latest version already
// contains rather than requiring the caller to resubmit it.
export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { propertyId, roomId } = parseOrThrow(
      confirmRoomUnderstandingParamSchema,
      await params,
    );
    const understanding =
      await homeIntelligenceService.confirmRoomUnderstanding(
        propertyId,
        roomId,
        userId,
      );
    return NextResponse.json({ understanding });
  },
);
