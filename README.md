# Nivasa

Phase 0 establishes the production-oriented foundation only. It intentionally does not implement customer-facing Phase 1 product flows or fake integrations.

## Stack
- Next.js, React, TypeScript frontend foundation.
- PostgreSQL with Prisma schema in `prisma/schema.prisma`.
- Provider-neutral server modules for AI, rendering, object storage, and payments.
- Deterministic backend pricing, tax, costing, BOQ, entitlement, payment-state, audit, and analytics foundations.

## Commercial packages
The backend-owned package price constants mirror the required initial configuration: FREE ₹0, NIVASA DESIGN ₹99, NIVASA COMPLETE ₹999, NIVASA PRO ₹9,999. Production package configuration is modeled in the database; `prisma/seed.ts` upserts only the required Phase 0 packages and should be extended through controlled admin/seed workflows before launch.

## No fake functionality
External AI, rendering, storage, and payment credentials are not present. The repository provides integration boundaries and server-side state models; it does not simulate successful AI jobs, payments, catalogue availability, analytics, or BOQ values as real data.
