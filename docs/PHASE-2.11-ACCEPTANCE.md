# Phase 2.11 — End-to-End Acceptance

Phase 2.11 is the final Phase 2 acceptance pillar. It does not introduce a parallel product path. It proves that the existing Phase 2 pillars compose into one dependency-ordered customer journey and that the repository's authoritative CI gate remains green.

## Canonical journey

1. Property is created.
2. Evidence / market intelligence is captured.
3. Design recommendation is produced.
4. Budget is drafted from design selections.
5. BOQ / procurement state is prepared.
6. Visualization is requested through the provider abstraction.
7. Execution is started through controlled workflow state.
8. Payment/commercial state is recorded.
9. User action/notification is emitted.
10. Journey reaches the terminal accepted state.

## Acceptance invariants

- Every stage is represented exactly once in the canonical contract.
- Stages cannot be silently skipped.
- Existing domain services and persistence paths remain authoritative; this contract does not duplicate them.
- Provider-dependent operations remain explicit dependencies; tests must not fabricate external provider success.
- Financial and historical invariants established by prior pillars remain in force.
- The acceptance suite must be deterministic and runnable in CI.

## Authoritative CI gate

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

## Completion rule

P2.11 is complete only when the end-to-end acceptance contract is merged and the **final integration head on `main` is green** across the authoritative gate. A green feature-branch run alone is insufficient.
