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

services -> jobs -> BullMQ/Redis -> provider adapters
services -> payments/storage/AI provider boundaries
```

## Product pipeline

Property -> Floor Plan -> Room Understanding -> Design -> Revisions -> Catalogue -> Costing -> BOQ -> Apartment Visualization -> 3D -> 360° -> Walkthrough -> Cinematic Video.

Phase 0 establishes durable domain contracts for the complete pipeline. Concrete external AI/render/storage/payment providers are implemented in later product phases without weakening the contracts.

## Security

Secrets are server-only. Client-exposed environment variables must be explicitly prefixed and must never contain provider credentials. Authorization is enforced server-side. Asset keys are treated as private identifiers and provider credentials never reach React components.
