# Development

## Local dependencies

- Node 22+
- npm
- PostgreSQL
- Redis (required for queue execution)
- Provider credentials only for the integrations you are actively testing

## Commands

```text
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

If a clean checkout does not yet contain `package-lock.json`, the CI bootstrap job creates and persists it before verification. Once committed, local development should always use `npm ci` rather than `npm install`.

## Database

Run Prisma migrations with `npx prisma migrate deploy` in deployment environments. Never use `prisma db push` as a production migration strategy.

## Providers

Redis, S3/R2, AI providers, Razorpay and OAuth/email providers are optional during unit tests. Their application boundaries fail explicitly with `NOT_CONFIGURED` when invoked without credentials; they are never simulated.

## Testing rule

Provider mocks are permitted only at the provider boundary. Domain, authorization, costing, entitlement and state-machine tests must remain deterministic and must not assert fake external success.
