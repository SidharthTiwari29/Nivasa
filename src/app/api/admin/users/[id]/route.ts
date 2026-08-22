import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  adminUserIdParamSchema,
  updateAdminUserSchema,
} from "@/server/validators/adminUser";
import { adminUserService } from "@/server/services/adminUserService";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const params = parseOrThrow(adminUserIdParamSchema, await context.params);
    const user = await adminUserService.get(params.id);
    return NextResponse.json({ user });
  },
);

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const actor = await requireAdmin();
    const params = parseOrThrow(adminUserIdParamSchema, await context.params);
    const body = parseOrThrow(updateAdminUserSchema, await request.json());
    const user = await adminUserService.updateRole(actor.role, params.id, body.role);
    return NextResponse.json({ user });
  },
);
