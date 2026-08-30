# Phase 3.1 — Production Architecture Hardening

## Objective

Establish a small, observable production boundary around the existing Phase 2 application without duplicating domain logic.

## Implemented

- A no-store `/api/health` endpoint.
- A live PostgreSQL readiness probe using the existing Prisma client.
- Explicit `200` ready and `503` not-ready responses.
- Safe failure output that does not expose database/provider error details.
- Deterministic tests for healthy and failed database probes.

## Acceptance invariants

1. Health responses are never cached.
2. Readiness is not reported when the database cannot be reached.
3. Internal database errors are not returned to callers.
4. The endpoint uses the existing Prisma singleton/adapter boundary.
5. The endpoint introduces no mock success path in production.
6. The test suite covers both success and failure behavior.

## Full P3.1 target

The remaining production-hardening work is tracked as subsequent increments: graceful shutdown, worker recovery/idempotency, request correlation, structured logging, migration safety, and production configuration validation. These are **TARGET**, not claimed implemented by this first P3.1 increment.

## Gate

No P3.1 increment is complete until its changes pass:

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
