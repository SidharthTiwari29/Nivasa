import type { Role } from "@prisma/client";
import { ForbiddenError, ValidationError } from "@/server/errors/AppError";

export type GovernanceContext = {
  userId: string;
  role: Role;
};

export const PRIVILEGED_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];

export function assertResourceAccess(
  context: GovernanceContext,
  ownerId: string,
): void {
  if (context.userId !== ownerId && !PRIVILEGED_ROLES.includes(context.role)) {
    throw new ForbiddenError("You do not have access to this resource");
  }
}

export function assertAllowedRole(
  context: GovernanceContext,
  ...roles: Role[]
): void {
  if (!roles.includes(context.role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")}`);
  }
}

const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export function validateIdempotencyKey(value: string): string {
  const key = value.trim();
  if (!IDEMPOTENCY_KEY.test(key)) {
    throw new ValidationError({
      field: "idempotencyKey",
      reason: "must be 8-128 characters using letters, numbers, ., _, :, or -",
    });
  }
  return key;
}

const SENSITIVE_KEY =
  /(authorization|cookie|password|secret|token|signature|access[_-]?key|refresh[_-]?token)/i;
const MAX_AUDIT_STRING_LENGTH = 2_000;
const MAX_AUDIT_DEPTH = 6;

export function redactAuditMetadata(value: unknown, depth = 0): unknown {
  if (depth > MAX_AUDIT_DEPTH) return "[REDACTED_DEPTH]";
  if (typeof value === "string") {
    return value.length > MAX_AUDIT_STRING_LENGTH
      ? `${value.slice(0, MAX_AUDIT_STRING_LENGTH)}…`
      : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactAuditMetadata(item, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key)
          ? "[REDACTED]"
          : redactAuditMetadata(item, depth + 1),
      ]),
    );
  }
  return value;
}

export type RateLimitState = {
  count: number;
  resetAtMs: number;
};

export type RateLimitDecision = RateLimitState & {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function evaluateFixedWindowRateLimit(
  state: RateLimitState | null,
  nowMs: number,
  limit: number,
  windowMs: number,
): RateLimitDecision {
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new ValidationError({
      field: "limit",
      reason: "must be a positive integer",
    });
  }
  if (!Number.isSafeInteger(windowMs) || windowMs <= 0) {
    throw new ValidationError({
      field: "windowMs",
      reason: "must be a positive integer",
    });
  }

  const active = state !== null && nowMs < state.resetAtMs;
  const current = active ? state : { count: 0, resetAtMs: nowMs + windowMs };
  const allowed = current.count < limit;
  const nextCount = allowed ? current.count + 1 : current.count;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((current.resetAtMs - nowMs) / 1_000));

  return {
    count: nextCount,
    resetAtMs: current.resetAtMs,
    allowed,
    retryAfterSeconds,
  };
}

export function toSafeError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (error instanceof ForbiddenError) {
    return { status: error.status, code: error.code, message: error.message };
  }
  if (error instanceof ValidationError) {
    return { status: error.status, code: error.code, message: error.message };
  }
  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  };
}
