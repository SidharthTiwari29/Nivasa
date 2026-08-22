import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { ForbiddenError, UnauthorizedError } from "@/server/errors/AppError";

export const ADMIN_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];

export function assertAdminRole(role: Role | null | undefined): asserts role is "ADMIN" | "SUPER_ADMIN" {
  if (!role || !ADMIN_ROLES.includes(role)) {
    throw new ForbiddenError("Administrator access required");
  }
}

export function assertSuperAdminRole(role: Role | null | undefined): asserts role is "SUPER_ADMIN" {
  if (role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Super administrator access required");
  }
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  assertAdminRole(session.user.role);
  return session.user;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  assertSuperAdminRole(session.user.role);
  return session.user;
}
