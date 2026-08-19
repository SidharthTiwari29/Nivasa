# Environment

All secrets are server-side. Never use `NEXT_PUBLIC_*` for database, Redis, AI, storage, payment or OAuth credentials.

## Core

- `DATABASE_URL` — PostgreSQL connection string.
- `NEXTAUTH_SECRET` — 32+ character signing/session secret.
- `NEXTAUTH_URL` — canonical application URL in deployed environments.

## Authentication

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER`, `EMAIL_FROM`

If neither Google nor email credentials are configured, Auth.js remains structurally present but sign-in is `NOT_CONFIGURED`.

## Queue

- `REDIS_URL`

BullMQ does not silently fall back to an in-memory queue.

## Object storage

- `S3_ENDPOINT` — optional for S3-compatible providers such as R2.
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

Objects are private and exposed through signed URLs.

## Payments

- `PAYMENT_PROVIDER=disabled|razorpay|stripe`
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- Stripe boundary: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

A frontend payment callback can never activate a purchase by itself.

## AI / rendering

`AI_PROVIDER` and concrete provider credentials should be added only when an adapter is implemented. Missing credentials result in `NOT_CONFIGURED`; no synthetic AI/render output is generated.

## Production

Use a managed PostgreSQL database, managed Redis, private S3/R2 storage, secret-manager backed credentials, HTTPS, database migrations and observable job workers. Rotate secrets without committing them to Git.
