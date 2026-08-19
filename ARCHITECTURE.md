# Nivasa architecture — Phase 0.1

Nivasa is a server-authoritative platform for turning a user's actual property and floor plan into a revision-controlled interior design, catalogue/cost/BOQ model, and eventually 3D/360/walkthrough/cinematic output.

## Boundaries

- `src/app/` contains UI and route handlers only.
- `src/server/` owns authentication, authorization, validation, repositories, services and provider adapters.
- Prisma is accessed through server modules only; React components never import Prisma.
- External input is validated with Zod.
- API responses use `{ ok: true, data }` and `{ ok: false, error }`.

## Authentication

Auth.js uses database sessions with Prisma. Google OAuth and email sign-in are enabled only when their server-side credentials exist. Missing credentials are surfaced as `NOT_CONFIGURED`; no fake login is generated. Roles are `USER`, `DESIGNER`, `ADMIN`, and `SUPER_ADMIN` with server-side permission checks.

## Async jobs

BullMQ + Redis provides the queue boundary. Job IDs are idempotency keys, retries use exponential backoff, and the Prisma `AIJob` model persists provider IDs, status, retry metadata and terminal timestamps. A missing `REDIS_URL` is an explicit configuration error.

Supported job classes include floor-plan processing/understanding, AI design generation, image/panorama/3D/walkthrough/video rendering, BOQ generation and notifications.

## Storage

`ObjectStorageProvider` is the application boundary. `S3ObjectStorageProvider` supports AWS S3 and S3-compatible endpoints such as Cloudflare R2 with private signed upload/download URLs. Credentials are server-only.

## AI and rendering

AI and rendering are provider-neutral. Interfaces preserve vision, floor-plan understanding, room/measurement/style extraction, design specification, image generation, BOQ assistance, 3D, 360, walkthrough and cinematic video capabilities. No provider is treated as successful without a real external result.

## Payments and entitlements

Razorpay is the India-first payment adapter with future Stripe compatibility. Verified webhooks are idempotent using `(provider,eventId)` and only server-side payment state can activate a purchase. Entitlements use `RESERVE → EXECUTE → CONFIRM` or `RESERVE → FAILURE → RELEASE`; reservation is atomic and concurrency-safe.

## Data integrity

Money is stored as integer minor units. Design versions and BOQ versions preserve snapshots. AI jobs and payment events have idempotency keys. Audit and analytics records remain backend-owned.

## Product north star

`PROPERTY → FLOOR PLAN → ROOM UNDERSTANDING → DESIGN → REVISIONS → CATALOGUE → COSTING → BOQ → ACTUAL-APARTMENT VISUALIZATION → 3D → 360° → WALKTHROUGH → CINEMATIC VIDEO → PURCHASE → EXECUTION`
