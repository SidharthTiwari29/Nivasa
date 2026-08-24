# Nivasa Phase 1 Step 2 — Budget Reality Engine

## Acceptance criteria

1. An authenticated property owner can create and read a versioned budget plan for their property.
2. Budget estimates are represented as low/target/high planning bands and every band is explicitly classified as an estimate, verified input, or Nivasa recommendation.
3. Budget versions preserve the exact scope, assumptions, source references and home-intelligence/Home-DNA versions used to produce them.
4. A budget version can be locked by its owner; locking records the actor and makes that decision immutable.
5. A locked budget is never overwritten by a later recalculation; later changes create a new version.
6. Monetary business arithmetic uses integer INR minor units; no JavaScript floating-point arithmetic is used for authoritative totals.
7. Scope lines support room/category allocation and deterministic low/target/high totals.
8. Repeated create requests with the same owner/property/idempotency key do not create duplicate budget versions.
9. Cross-owner properties are rejected with the canonical authorization boundary.
10. Locking a missing, foreign, or already locked version fails without mutating budget history.
11. Missing pricing inputs remain explicit; Step 2 does not fabricate catalogue prices, warranties, specifications or provider claims.
12. The API remains thin: authentication → validation → service → repository, with normalized domain errors.
13. Tests cover successful creation, deterministic arithmetic, idempotency, ownership rejection, locking and immutable-history behavior.
14. Prisma migration is additive and safe for the existing Phase 0/0.1 and Step 1 schema.

## Test matrix

| Area | Success | Critical negative case |
| --- | --- | --- |
| Budget validator | Valid scope/ranges accepted | Negative/non-integer money rejected |
| Calculation | Low ≤ target ≤ high and totals are exact | Invalid range ordering rejected |
| Repository | Owner-scoped version persistence | Foreign property cannot be read or mutated |
| Idempotency | Same key returns the original version | Same key cannot create a second version |
| Lock | Owner locks an unlocked version | Locked version cannot be mutated or locked twice |
| History | New recalculation creates a new version | Existing locked version is never overwritten |
| Provenance | Estimate/source/recommendation remain explicit | Unclassified pricing input rejected |
| API | Authenticated owner can create/read/lock | Unauthenticated/cross-owner request rejected |

## CI gate

The repository CI chain remains authoritative: `npm ci`, `format:check`, `lint`, `prisma generate`, `typecheck`, `test`, `prisma validate`, `build`, and `git diff --check`.
