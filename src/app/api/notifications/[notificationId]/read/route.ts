import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { notificationIdParamSchema } from "@/server/validators/notification";
import { notificationService } from "@/server/services/notificationService";

type RouteParams = { params: Promise<{ notificationId: string }> };

export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { notificationId } = parseOrThrow(
      notificationIdParamSchema,
      await params,
    );
    await notificationService.markRead(notificationId, userId);
    return new NextResponse(null, { status: 204 });
  },
);
