import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { accountDeletionService } from "@/server/privacy/accountDeletionService";

// A user may only delete their own account through this endpoint - there
// is deliberately no "delete any user by id" parameter here, since account
// deletion is a self-service right, not an admin action performed on
// someone else's behalf without their own request initiating it.
export const POST = withErrorHandling(async () => {
  const { userId } = await requireAuth();
  const result = await accountDeletionService.deleteAccount(userId, userId);
  return NextResponse.json(result);
});
