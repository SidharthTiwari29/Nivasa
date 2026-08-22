# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home interior platform for India. The architecture is built around the user's real property, rooms, floor plans, designs, catalogue, costing, BOQ and final-apartment visualization—not isolated image generation.

## Production foundation

The current `main` branch contains the completed Phase 0 / Phase 0.1 foundation. The foundation provides:

- Next.js application and server-authoritative architecture.
- Auth.js authentication with Google/email provider boundaries and persisted roles: `USER`, `DESIGNER`, `ADMIN`, `SUPER_ADMIN`.
- Zod validation, repository/service boundaries and consistent API error handling.
- Property, room and floor-plan persistence with owner-scoped authorization.
- Canonical asset ownership checks and S3-compatible signed upload/download boundaries.
- Durable AI/job state contracts with idempotency and explicit retry/failure semantics.
- Provider-neutral AI and rendering interfaces; unconfigured providers fail explicitly rather than returning fabricated results.
- Razorpay-ready payment boundaries, webhook verification/idempotency and server-authoritative entitlements.
- Transactional credit reservation/confirmation/release semantics.
- Server-side administrator and super-administrator authorization boundaries.
- Security, environment validation, auditability, tests and GitHub Actions verification.

The architecture deliberately preserves the complete Nivasa north star: property → floor plan → room understanding → design → revisions → catalogue → costing/BOQ → actual-apartment visualization → 3D/360/walkthrough/video → purchase/execution.

## Local development

1. Copy `.env.example` to `.env`.
2. Provide the environment-specific database/auth/provider values required for the capability you are exercising.
3. Install from the committed lockfile with `npm ci`.
4. Generate Prisma client with `npx prisma generate`.
5. Run the development server with `npm run dev`.

External providers are optional during deterministic CI. Missing provider credentials must surface as explicit configuration failures; tests must not simulate successful external side effects.

## Verification

The authoritative CI chain is:

```text
format check → lint → Prisma generate → typecheck → tests → Prisma validate → production build → diff check
```

Run the same checks locally when changing production code:

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

Production assumptions, required environment variables, deployment boundaries, provider configuration, database migration expectations, background-job operation and security practices are documented in `docs/OPERATIONS.md`.

Real production credentials are never committed to the repository.
