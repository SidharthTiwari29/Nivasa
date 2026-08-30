import { describe, expect, it } from "vitest";
import type { Role } from "@prisma/client";
import { ForbiddenError, ValidationError } from "@/server/errors/AppError";
import {
  assertAllowedRole,
  assertResourceAccess,
  evaluateFixedWindowRateLimit,
  redactAuditMetadata,
  toSafeError,
  validateIdempotencyKey,
} from "@/server/security/governance";

const context = (userId: string, role: Role = "USER") => ({ userId, role });

describe("P2.10 security governance", () => {
  it("enforces owner isolation while allowing privileged roles", () => {
    expect(() => assertResourceAccess(context("u1"), "u2")).toThrow(ForbiddenError);
    expect(() => assertResourceAccess(context("u1"), "u1")).not.toThrow();
    expect(() => assertResourceAccess(context("admin", "ADMIN"), "u2")).not.toThrow();
    expect(() => assertResourceAccess(context("root", "SUPER_ADMIN"), "u2")).not.toThrow();
  });

  it("enforces explicit role allowlists", () => {
    expect(() => assertAllowedRole(context("u1"), "ADMIN")).toThrow(ForbiddenError);
    expect(() => assertAllowedRole(context("a", "ADMIN"), "ADMIN", "SUPER_ADMIN")).not.toThrow();
  });

  it("accepts safe idempotency keys and rejects malformed keys", () => {
    expect(validateIdempotencyKey("order-2026-08-30_01")).toBe("order-2026-08-30_01");
    expect(() => validateIdempotencyKey("short")).toThrow(ValidationError);
    expect(() => validateIdempotencyKey("bad key 123")).toThrow(ValidationError);
    expect(() => validateIdempotencyKey("a".repeat(129))).toThrow(ValidationError);
  });

  it("redacts sensitive audit metadata and bounds strings/depth", () => {
    const result = redactAuditMetadata({
      authorization: "Bearer secret",
      nested: { password: "pw", safe: "ok" },
      long: "x".repeat(2_100),
    }) as Record<string, unknown>;

    expect(result.authorization).toBe("[REDACTED]");
    expect(result.nested).toEqual({ password: "[REDACTED]", safe: "ok" });
    expect(result.long).toHaveLength(2_001);
  });

  it("enforces a deterministic fixed-window rate limit", () => {
    const first = evaluateFixedWindowRateLimit(null, 0, 2, 60_000);
    const second = evaluateFixedWindowRateLimit(first, 1_000, 2, 60_000);
    const blocked = evaluateFixedWindowRateLimit(second, 2_000, 2, 60_000);
    const reset = evaluateFixedWindowRateLimit(blocked, 60_000, 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(58);
    expect(reset.allowed).toBe(true);
    expect(reset.count).toBe(1);
  });

  it("never exposes unexpected internal error details", () => {
    const safe = toSafeError(new Error("database password leaked"));
    expect(safe).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  });
});
