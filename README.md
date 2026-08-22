# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home interior platform for India. The production architecture is built around the user's real property, rooms, floor plans, designs, revisions, catalogue, costing, BOQ, actual-apartment visualization, rendering, commercial packages and entitlement enforcement.

## Phase 0.1 production foundation

Phase 0.1 establishes the complete server-side production foundation required by the product contract:

- Auth.js authentication boundaries with persisted `USER`, `DESIGNER`, `ADMIN`, `SUPER_ADMIN` roles and server-side authorization.
- Zod validation, repository/service boundaries, structured API errors, environment validation and audit logging.
- Owner-scoped property, room and floor-plan persistence and secure S3-compatible signed storage.
- Design project → version → revision lifecycle with persisted revision instructions and concurrency-safe version numbering.
- Durable AI job state with idempotency keys, BullMQ/Redis queue configuration, retries/backoff and a worker lifecycle that never fabricates provider success.
- Provider-neutral AI contracts for floor-plan analysis, design generation/revision, BOQ assistance and walkthrough prompting.
- Provider-neutral rendering contracts for design images, panorama, 3D, walkthrough, video and before/after output.
- Backend-owned commercial packages, server-created payment orders, Razorpay webhook signature verification, idempotent purchase activation and entitlement provisioning.
- Transactional entitlement reserve/confirm/release semantics with idempotency and concurrency protection.
- Catalogue and deterministic BOQ/costing services using persisted catalogue prices rather than hardcoded fake catalogue results.
- Security headers, safe failure behaviour, operational documentation and CI verification through production build.

### Provider configuration

Provider integrations are real boundaries, not fake successes. When credentials are absent the application fails explicitly with configuration errors. Razorpay is implemented as the India payment adapter; AI and rendering adapters remain provider-neutral until a concrete provider is configured. BullMQ/Redis is required when asynchronous jobs are submitted or a worker is started.

The architecture preserves the full Nivasa north star: property → floor plan → room understanding → design → user-controlled revisions → catalogue → costing/BOQ → actual-apartment visualization → 3D/360/walkthrough/video → purchase/execution.

## Local development

1. Copy `.env.example` to `.env`.
2. Install from the committed lockfile with `npm ci`.
3. Provide PostgreSQL, Auth.js and any provider credentials required for the capability being exercised.
4. Run `npx prisma generate` and `npx prisma migrate deploy` against a development database.
5. Run `npm run dev`.

For background jobs, run a Redis instance and start a process that calls `createNivasaWorker()` from `src/server/jobs/worker.ts`. Do not start workers without `REDIS_URL`.

## Verification

The authoritative CI chain is:

```text
format check → lint → Prisma generate → typecheck → tests → Prisma validate → production build → diff check
```

Run:

```bash
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

## Operations

See `ARCHITECTURE.md`, `DEVELOPMENT.md` and `docs/OPERATIONS.md` for provider configuration, migration policy, queue/worker operation, payment webhook handling, security requirements, deployment assumptions and failure behaviour.

Never commit production credentials or activate paid entitlements from a frontend success callback. Webhooks and server-side state are authoritative.
