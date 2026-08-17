# Architecture

Nivasa Phase 0 is organized around server-authoritative boundaries.

## Frontend
The Next.js app shell is minimal and exists to verify the React/TypeScript foundation. Catalogue, package prices, entitlements, payments, costing, and BOQ data must come from backend APIs rather than hard-coded components.

## Backend/API conventions
API responses use a structured `{ ok, data }` or `{ ok, error }` convention. Runtime configuration is validated with Zod. Authentication and RBAC foundations separate user roles from permissions.

## Providers
Object storage, AI, rendering, and payment modules expose provider-neutral interfaces. AI capabilities include vision analysis, design specification generation, image generation, rendering, future 3D, and video. Render outputs are typed as images, panoramas, 3D scenes, walkthroughs, video, JSON, or PDF so the asset model is not image-only.

## Async jobs
`AIJob` stores idempotent asynchronous work, provider job identifiers, status, input, result, and error payloads. `AIUsage` records provider/model/capability usage and cost metadata.

## Entitlements
The intended execution path is authenticate, load active purchase entitlement grants, atomically reserve usage with an idempotency key in a database transaction that locks the entitlement grant row, execute work, then confirm or release the reservation. Frontend success pages never activate entitlements.

## Payments
The intended flow is package selection, backend payment order creation, provider confirmation, verified idempotent webhook processing, purchase activation, entitlement activation, and invoice issuance.

## Costing and BOQ
Financial arithmetic is deterministic backend logic. BOQ versions snapshot pricing, tax, labour assumptions, and totals so historical estimates remain reproducible.


## Commercial configuration
The four Phase 0 package definitions are backend-owned configuration and are represented by the `Package`, `PackageFeature`, and `PackageEntitlement` models. `prisma/seed.ts` contains only the required package price configuration and does not create fake catalogue or usage data.
