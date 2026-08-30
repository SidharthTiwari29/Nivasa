import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { referralService } from "@/server/services/referralService";

export const GET = withErrorHandling(async () => {
  const { userId } = await requireAuth();
  const code = await referralService.getOrCreateMyCode(userId);
  return NextResponse.json({ code });
});
