import type { Prisma, PrismaClient } from "@prisma/client";
import { redactAuditMetadata } from "@/server/security/governance";

type AuditClient = Pick<PrismaClient, "auditLog">;

export type AppendAuditLogInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  requestId?: string | null;
  metadata?: unknown;
};

export async function appendAuditLog(
  client: AuditClient,
  input: AppendAuditLogInput,
) {
  return client.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
      metadata:
        input.metadata === undefined
          ? undefined
          : (redactAuditMetadata(input.metadata) as Prisma.InputJsonValue),
    },
  });
}
