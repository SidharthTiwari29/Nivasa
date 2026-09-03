import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { listAuditLogs } from "@/server/services/auditService";

const querySchema = z.object({
  entity: z.string().trim().min(1).optional(),
  entityId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

export const GET = withErrorHandling(async (request: Request) => {
  await requireAdmin();
  const url = new URL(request.url);
  const filters = parseOrThrow(querySchema, {
    entity: url.searchParams.get("entity") ?? undefined,
    entityId: url.searchParams.get("entityId") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  const logs = await listAuditLogs(filters);
  return NextResponse.json({ logs });
});
