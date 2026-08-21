# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home interior platform for India. The product architecture is designed around the user's real property, rooms, designs, catalogue, costing, BOQ and final apartment visualization—not isolated image generation.

## Phase 0

Phase 0 is the complete production foundation. There is no Phase 0.1. It establishes the application, database, authentication/RBAC, server boundaries, jobs, payments/storage/AI provider contracts, security configuration, testing and CI required for subsequent product phases.

## Verification

Run `npm install`, then `npm run format:check`, `npm run lint`, `npx prisma generate`, `npm run typecheck`, `npm test`, `npx prisma validate`, and `npm run build`.

Real production credentials are never committed. Copy `.env.example` to a local `.env` and provide environment-specific values.
