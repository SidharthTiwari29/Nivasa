export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'PAYMENT_WEBHOOK' | 'ENTITLEMENT_RESERVATION';
export type AuditEntry = { actorId?: string; action: AuditAction; entityType: string; entityId?: string; metadata?: unknown; createdAt: Date };
