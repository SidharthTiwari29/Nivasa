import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { notificationService } from "@/server/services/notificationService";

export const POST = withErrorHandling(async () => {
  const { userId } = await requireAuth();
  await notificationService.markAllRead(userId);
  return new NextResponse(null, { status: 204 });
});
