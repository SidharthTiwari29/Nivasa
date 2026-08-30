# Phase 2 — Master Implementation Plan

## Objective

Phase 2 turns the Phase 1 intelligence foundation into an evidence-backed, executable home-design platform. This document is the fixed Phase 2 implementation contract.

## Pillars

1. **Evidence & Market Intelligence** — governed source adapters, observations, provenance, freshness, conflict handling, unknown-state preservation, and evidence-backed downstream decisions.
2. **Catalogue & Product Intelligence** — canonical products, variants, normalization, deduplication, price history, availability, warranty, suppliers, and evidence-backed ranking.
3. **Design Recommendation Engine** — Home DNA, room/function, style, budget, space and catalogue constraints with explainable, evidence-backed recommendations.
4. **Design → Budget Integration** — design selections become budget scope, revisions propagate deterministically, and every impact is auditable.
5. **BOQ / Procurement Readiness** — executable BOQ generation, supplier mapping, procurement states, substitutions, approvals and audit history.
6. **Visualization Pipeline** — canonical scene representation, version-linked generation, provider abstraction, status/retry handling and provenance.
7. **Execution Workflow** — project lifecycle, approvals, procurement, installation, change requests and controlled state transitions.
8. **Payments & Commercial Execution** — project commercial state, milestones, payment verification, adjustments and financial auditability.
9. **Notifications & User Actions** — contextual action-required, approval, budget, procurement, payment and execution notifications with idempotency and frequency controls.
10. **Security & Governance** — resource isolation, authorization, immutable history, auditability, validation, idempotency, rate limits and safe error handling.
11. **End-to-End Acceptance** — full customer journey tests plus the authoritative CI gate.

## Completion rule

A Phase 2 pillar is not complete because an API or schema exists. It is complete only when its contract is implemented, authorized, tested, integrated with existing foundations, and passes the acceptance gate.

## Non-negotiables

- No fabricated product, price, availability, warranty, supplier, savings or execution claims.
- Unknown and inferred information remain explicitly represented.
- Existing Phase 1 persistence paths are extended rather than duplicated.
- Deterministic financial calculations remain integer/minor-unit based where applicable.
- Locked historical decisions cannot be silently mutated.
- External providers are represented as explicit dependencies until actually integrated.
- Final Phase 2 completion requires a green final-head CI run.

## Delivery order

Implementation proceeds in dependency order: P2.1 Evidence & Market Intelligence → P2.2 Catalogue/Product Intelligence → P2.3 Recommendations → P2.4 Design/Budget → P2.5 BOQ/Procurement → P2.6 Visualization → P2.7 Execution → P2.8 Commercial → P2.9 Notifications → P2.10 Governance hardening → P2.11 End-to-End acceptance.

## Acceptance gate

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

No pillar is marked complete while the final integration head is red.
