# Phase 1 — Pillars 2, 3, 6 and 7 Acceptance

## Scope

This slice closes the following canonical Phase 1 product domains:

- **P2 Home DNA** — persistent household, lifestyle, design personality, storage, functional, future and smart-home preferences.
- **P3 Budget Reality Engine** — versioned budget plans, low/target/high bands, provenance/truth classification, immutable locking/history, owner authorization, idempotent creation and deterministic INR minor-unit arithmetic.
- **P6 What-If + Savings** — deterministic replacement/add/remove/modify previews, exact price deltas when evidence exists, substitution ranking, uncertainty preservation and persisted budget impacts.
- **P7 Smart Home** — capability model, room targeting, scenarios, visualization state and immutable persistence through Home DNA versions.

## P2 acceptance

- Home DNA is versioned per property.
- A Home DNA version references the Home Intelligence version used to create it.
- Historical versions are retained.
- Home DNA is owner-scoped through the existing authorization boundary.
- Unknown information is not silently converted into facts.
- Smart-home preferences remain part of the persistent Home DNA record.

## P3 acceptance

- Budget versions are immutable historical records.
- A budget plan can be locked and the lock actor/time/version are retained.
- Locked plans reject mutation through the existing service/repository boundary.
- Recalculation creates a new version rather than overwriting history.
- Low/target/high totals are calculated with bigint INR minor units.
- Catalogue-backed and custom scope lines remain distinguishable.
- Budget creation is idempotent by owner/property/idempotency key.
- Cross-owner access is rejected.
- Budget impact records preserve the reason and calculation inputs.

## P6 acceptance

- What-If preview is authenticated and validated.
- Replacement, addition, removal and modification are explicit scope-change types.
- Known prices use exact bigint arithmetic for deltas and savings.
- Unknown prices remain `null`; the engine never invents savings.
- Existing evidence-backed substitution ranking is reused rather than duplicated.
- Preview results do not mutate the budget.
- Commit persists the proposed low/target/high budget deltas through the existing Budget Reality impact path.
- All committed inputs preserve the What-If context for auditability.

## P7 acceptance

- Smart-home capabilities are a typed, extensible contract.
- Capabilities can target specific rooms.
- Scenarios reference capabilities and are retained only when all referenced capabilities are enabled.
- Visualization state is explicit: `NOT_CONFIGURED`, `PREVIEW`, or `ACTIVE`.
- Smart-home plans are deterministically compiled.
- Smart-home changes create a new immutable Home DNA version instead of mutating history.
- The authenticated API exposes GET/POST/PATCH operations.

## CI gate

The release gate remains authoritative and must be green before merge:

```text
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

Repository-wide Prettier formatting is applied automatically on this PR before the authoritative CI gate.

No external product, price, warranty, availability, AI or supplier claim is fabricated by these pillars.
