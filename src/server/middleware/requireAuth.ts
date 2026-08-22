import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { ForbiddenError, UnauthorizedError } from "@/server/errors/AppError";

export type AuthedContext = {
  userId: string;
  role: Role;
};

export async function requireAuth(): Promise<AuthedContext> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return { userId: session.user.id, role: session.user.role };
}

export async function requireRole(...allowed: Role[]): Promise<AuthedContext> {
  const ctx = await requireAuth();
  if (!allowed.includes(ctx.role)) {
    throw new ForbiddenError(`Requires one of: ${allowed.join(", ")}`);
  }
  return ctx;
}
