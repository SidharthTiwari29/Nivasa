import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { listNotificationsQuerySchema } from "@/server/validators/notification";
import { notificationService } from "@/server/services/notificationService";

export const GET = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const url = new URL(request.url);
  const { unreadOnly } = parseOrThrow(listNotificationsQuerySchema, {
    unreadOnly: url.searchParams.get("unreadOnly") ?? undefined,
  });
  const notifications = await notificationService.list(
    userId,
    unreadOnly ?? false,
  );
  return NextResponse.json({ notifications });
});
