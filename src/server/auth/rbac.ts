export const ROLES = ['USER', 'DESIGNER', 'ADMIN', 'SUPER_ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'project:read',
  'project:write',
  'design:review',
  'catalogue:manage',
  'moderation:manage',
  'audit:read',
  'payment:manage',
  'analytics:read',
  'user:manage',
  'package:manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const rolePermissions: Record<Role, readonly Permission[]> = {
  USER: ['project:read', 'project:write'],
  DESIGNER: ['project:read', 'project:write', 'design:review'],
  ADMIN: [
    'project:read',
    'project:write',
    'design:review',
    'catalogue:manage',
    'moderation:manage',
    'audit:read',
    'payment:manage',
    'analytics:read',
    'user:manage',
    'package:manage',
  ],
  SUPER_ADMIN: PERMISSIONS,
};

const roleRank: Record<Role, number> = {
  USER: 10,
  DESIGNER: 20,
  ADMIN: 30,
  SUPER_ADMIN: 40,
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasMinimumRole(role: Role, minimumRole: Role): boolean {
  return roleRank[role] >= roleRank[minimumRole];
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error('FORBIDDEN');
  }
}
