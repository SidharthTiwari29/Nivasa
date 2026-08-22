# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home interior platform for India. The architecture is built around the user's real property, rooms, floor plans, designs, catalogue, costing, BOQ and final-apartment visualization—not isolated image generation.

## Production foundation

The current `main` branch contains the Phase 0 / Phase 0.1 production foundation. The foundation provides:

- Next.js application and server-authoritative architecture.
- Auth.js authentication with Google/email provider boundaries and persisted roles: `USER`, `DESIGNER`, `ADMIN`, `SUPER_ADMIN`.
- Zod validation, repository/service boundaries and consistent API error handling.
- Property, room and floor-plan persistence with owner-scoped authorization.
- Canonical asset ownership checks and a real S3-compatible signed upload/download implementation.
- Server-side administrator and super-administrator authorization boundaries, including privilege-escalation prevention (an `ADMIN` cannot grant `ADMIN`/`SUPER_ADMIN` access; only a `SUPER_ADMIN` can).
- Security, environment validation, auditability, tests and GitHub Actions verification for the above.

**Not yet implemented** (these have typed, fail-closed interface boundaries per `ARCHITECTURE.md`, but no working provider behind them yet):

- AI generation, rendering, and job-worker execution — `AIProvider`/`StorageProvider`-style interfaces exist and throw explicitly when unconfigured; no real provider is wired in, and there is no BullMQ worker consuming jobs yet.
- Payments — no Razorpay implementation, no webhook route, no signature verification exists yet. `PaymentProvider` is a throw-if-unconfigured stub.
- Credit reservation/confirmation/release logic exists and is tested in isolation, but is not yet wired to any job submission or payment flow.

The architecture deliberately preserves the complete Nivasa north star: property → floor plan → room understanding → design → revisions → catalogue → costing/BOQ → actual-apartment visualization → 3D/360/walkthrough/video → purchase/execution. See `ARCHITECTURE.md` for how the current contracts support that pipeline without weakening it.

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
