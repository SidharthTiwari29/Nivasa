# Nivasa Architecture

## Boundary

UI and route handlers call server services. Services own business rules and transactions. Repositories own persistence. Provider adapters are server-only and fail closed when not configured.

```text
UI
 -> app/api
 -> validators / auth
 -> services
 -> repositories
 -> Prisma/PostgreSQL

services -> BullMQ/Redis -> durable AIJob state -> AI/render provider adapters
services -> payments -> Razorpay adapter -> verified webhook -> purchase -> entitlement
services -> storage -> S3-compatible signed URLs
```

## Product pipeline

Property -> Floor Plan -> Room Understanding -> Design -> Revisions -> Catalogue -> Costing -> BOQ -> Apartment Visualization -> 3D -> 360° -> Walkthrough -> Cinematic Video.

Phase 0.1 establishes the durable persistence, lifecycle, queue, storage, AI, rendering, payments and entitlement boundaries for the complete pipeline. Concrete AI and rendering vendors remain replaceable provider adapters. The application never treats an unconfigured provider as a successful operation.

## Jobs

Every asynchronous operation receives a durable `AIJob` identity and idempotency key before it is queued. BullMQ provides retries and backoff; the database is authoritative for job state. A worker records `RUNNING` before provider execution and records `SUCCEEDED` only after a real provider result. Provider/configuration failures become explicit `FAILED` state.

## Commercial system

Packages are backend-owned. Purchase creation reads the package from PostgreSQL, creates the provider order server-side and persists the provider order identifier. Paid entitlements are activated only from a signature-verified Razorpay webhook. The activation transaction is idempotent and creates the entitlement exactly once.

## Security

Secrets are server-only. Client-exposed environment variables must be explicitly prefixed and must never contain provider credentials. Authorization is enforced server-side. Asset keys are private identifiers. Security headers are applied globally. Redis-backed rate-limit primitives are available for abuse-sensitive endpoints.
