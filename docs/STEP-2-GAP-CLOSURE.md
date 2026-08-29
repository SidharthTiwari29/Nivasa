# Nivasa — Step 2 Gap Closure

## Purpose

This document converts the canonical README vision into an evidence-driven implementation sequence. It is intentionally conservative: a capability is not considered implemented merely because a schema field, job type, or product concept exists.

## Current production baseline

- Phase 0 foundation: established on `main`.
- Phase 0.1 production hardening: established on `main`.
- Phase 1 Step 1 — Home Intelligence / Home DNA: established on `main`.
- Phase 1 Step 2 — Budget Reality + Market/Product Intelligence: substantial implementation exists in PR #24 and remains subject to acceptance before merge.

## Gap-closure order

1. Budget Reality / Budget Intelligence
2. Catalogue and Product Intelligence
3. Interior Intelligence Graph
4. What-If / Savings
5. Design Intelligence and layout-to-design grounding
6. Reality Check / buildability
7. Commercial plans and server-enforced entitlements
8. Visualization foundation
9. Nivasa Immersive
10. Nivasa Home Book and evolving Nivasa DNA
11. Assistant, localization and Nivasa Moments
12. Nivasa Finds / proactive discovery
13. Procurement
14. Execution, quality, snagging and handover

## Step 2 acceptance rules

Every implementation slice must preserve ownership boundaries, validation, provenance, deterministic money arithmetic, idempotency where required, migration safety, auditability and backward compatibility with the production baseline.

Market/product facts must never be fabricated. Product observations must retain source/evidence and retrieval timing; an observation is not automatically a verified market truth.

## Definition of done for each slice

A slice is complete only when:

1. The implementation exists on a reviewable Git branch/PR.
2. Schema changes have a migration and Prisma validation succeeds.
3. Validators, services/repositories and API boundaries are covered as applicable.
4. Ownership/authorization is enforced.
5. Deterministic calculations have focused tests.
6. Existing behaviour remains green.
7. The production CI gate passes: `npm ci`, format check, lint, Prisma generate, typecheck, tests, Prisma validate, build and `git diff --check`.
8. Acceptance documentation states exactly what is implemented and explicitly lists remaining gaps.

## Explicit non-goals for this slice

Do not claim or implement downstream UI/personality/immersive/procurement capabilities merely because they appear in the README. They depend on the intelligence and data foundations above them.

## North-star dependency chain

`Intelligence → What-If/Savings → Smart Home → Buildability/BOQ → Localization/Assistant/Notifications → Commercial/Visualization → Walkthrough → Execution.`

No feature gets built just because it sounds exciting. Each feature must have a customer outcome, trustworthy data/logic, measurable acceptance criteria and a dependency-complete foundation.
