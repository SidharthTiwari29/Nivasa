import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { adminUserService } from "@/server/services/adminUserService";

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  const users = await adminUserService.list();
  return NextResponse.json({ users });
});
