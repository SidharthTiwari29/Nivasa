import type { Role } from '@/server/auth/rbac';
import { hasMinimumRole } from '@/server/auth/rbac';

export function assertAdmin(role: Role): void {
  if (!hasMinimumRole(role, 'ADMIN')) throw new Error('FORBIDDEN');
}

export function assertSuperAdmin(role: Role): void {
  if (!hasMinimumRole(role, 'SUPER_ADMIN')) throw new Error('FORBIDDEN');
}
