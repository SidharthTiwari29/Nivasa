export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type Permission = 'project:read' | 'project:write' | 'catalogue:manage' | 'audit:read' | 'payment:manage';

const rolePermissions: Record<Role, Permission[]> = {
  USER: ['project:read', 'project:write'],
  ADMIN: ['project:read', 'project:write', 'catalogue:manage', 'audit:read', 'payment:manage'],
  SUPER_ADMIN: ['project:read', 'project:write', 'catalogue:manage', 'audit:read', 'payment:manage'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
