# Phase 2.10 — Security & Governance

## Objective

Harden the Phase 2 surface with reusable, deterministic controls for resource isolation, role authorization, idempotency input, audit metadata, rate-limit policy, and safe error exposure.

## Contract

P2.10 must preserve these invariants:

1. **Resource isolation** — a non-privileged user can access only resources owned by that user. Administrative roles are explicitly privileged rather than implicitly trusted.
2. **Authorization** — privileged operations require an explicit role allowlist.
3. **Idempotency** — idempotency keys are validated before reaching state-changing operations; malformed or unbounded keys are rejected.
4. **Auditability** — audit writes are append-only at the application repository boundary, and sensitive metadata is redacted before persistence.
5. **Rate limiting** — fixed-window decisions are deterministic and expose a retry interval for rejected requests. A shared/distributed store must be supplied by the runtime boundary when rate limiting is applied across instances.
6. **Safe errors** — unexpected errors are mapped to a stable generic internal error and must not expose credentials, database details, provider responses, or stack traces.
7. **No silent mutation** — governance helpers do not provide update/delete operations for audit records; locked domain history remains governed by its owning domain service.

## Implemented surface

- `src/server/security/governance.ts`
  - resource-owner enforcement
  - explicit role enforcement
  - idempotency-key validation
  - recursive sensitive audit metadata redaction with depth/string bounds
  - deterministic fixed-window rate-limit evaluation
  - safe unexpected-error mapping
- `src/server/repositories/auditLogRepository.ts`
  - append-only audit-log creation using the existing `AuditLog` persistence model
  - centralized metadata redaction
- `src/server/security/governance.test.ts`
  - ownership/privileged access
  - role allowlists
  - idempotency validation
  - audit redaction/bounds
  - rate-limit decisions
  - safe error exposure

## Acceptance gate

```text
npm ci
npm run format:check
npm run lint
npx prisma generate
npm run typecheck
npm test
npx prisma validate
npm run build
git diff --check
```

P2.10 is complete only after the implementation is merged and the final integration head is green.
