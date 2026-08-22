import { prisma } from "@/server/db/prisma";

export function recordAudit(input: { userId?: string; action: string; entity: string; entityId?: string; requestId?: string; metadata?: Record<string, unknown> }) {
  return prisma.auditLog.create({ data: input });
}

export function listAuditLogs(input: { entity?: string; entityId?: string; userId?: string; limit?: number }) {
  return prisma.auditLog.findMany({ where: { entity: input.entity, entityId: input.entityId, userId: input.userId }, orderBy: { createdAt: "desc" }, take: Math.min(input.limit ?? 100, 500) });
}
