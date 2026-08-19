# Nivasa

Nivasa is an AI-powered home-interior platform designed around the user's **actual property**, floor plan and design choices — not a generic image generator.

## Product north star

`PROPERTY → FLOOR PLAN → ROOM UNDERSTANDING → DESIGN → REVISIONS → CATALOGUE → COSTING → BOQ → ACTUAL-APARTMENT VISUALIZATION → 3D → 360° → WALKTHROUGH → CINEMATIC VIDEO → PURCHASE → EXECUTION`

Phase 0.1 hardens the production backend foundation while preserving that full scope.

## Stack

- Next.js / React / TypeScript
- PostgreSQL / Prisma
- Auth.js with Google/email provider boundaries
- BullMQ / Redis for durable asynchronous work
- S3-compatible private object storage (AWS S3 / Cloudflare R2)
- Provider-neutral AI and rendering interfaces
- Razorpay-first payment boundary with future Stripe compatibility
- Vitest, ESLint and Prettier

## Commercial packages

Backend-owned packages remain: FREE ₹0, NIVASA DESIGN ₹99, NIVASA COMPLETE ₹999, NIVASA PRO ₹9,999. No catalogue or AI usage is fabricated to make these packages appear functional.

## Production rules

- UI never talks directly to Prisma.
- Authentication and entitlement decisions are server authoritative.
- Paid access is activated only from verified server-side payment state.
- Queue, AI, storage and rendering integrations fail explicitly with `NOT_CONFIGURED` when credentials/adapters are absent.
- Financial values use integer minor units and deterministic calculation logic.
- No fake AI output, payment success, catalogue records, render completion, analytics or BOQ values.

## Verification

```text
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

See `ARCHITECTURE.md`, `DEVELOPMENT.md` and `ENVIRONMENT.md` for operational details.
