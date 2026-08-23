# Nivasa Phase 1 Architecture

**Status:** Architecture freeze baseline

**Baseline:** `main` @ `00e55add09d655a4a9aae0c0576a7d85b9e39aee`

**Canonical product issue:** `#20 — NIVASA Phase 1 — Home Intelligence to Design-to-Execution Product`

## 1. Purpose

Phase 1 turns the production foundation into the first complete user-facing Nivasa product journey:

`Create Home -> Understand Home -> Understand User -> Budget -> Design -> Explain -> Real Products -> What-If -> Savings -> Smart Home -> Buildability -> BOQ -> Visualize -> Experience -> Execute`

Phase 1 is one phase. The numbered delivery steps in issue #20 are implementation sequencing only; they are not additional phases.

## 2. Existing stable foundation

Phase 0/0.1 already provides:

- Next.js application and CI release gate.
- Auth.js with persisted roles and server authorization.
- Zod validators, server service/repository boundaries and structured errors.
- PostgreSQL/Prisma persistence.
- Property, floor plan, room and design project/version/revision models.
- Durable AI jobs with BullMQ/Redis boundaries.
- Provider-neutral AI and rendering contracts.
- S3-compatible asset storage boundaries.
- Catalogue, price, costing and BOQ foundations.
- Backend-owned packages, Razorpay payment boundary and entitlement lifecycle.
- Audit logging, security headers and route-level Redis rate limiting on payment endpoints.

Phase 1 must build on these contracts rather than replace them.

## 3. Current gaps identified from the actual `main` schema/application

The current schema is a production foundation, not yet the complete Phase 1 product model. The following are intentionally absent or insufficient and must be added deliberately:

### Home/property intelligence
`Property` currently contains `name` and optional `address`, but not the complete product-level property profile. Phase 1 needs structured fields for property type, configuration, possession timing, location and user-confirmed home understanding metadata.

### Home DNA
There is no dedicated persistent Home DNA aggregate. Household, lifestyle, design personality, storage, functional requirements, future needs and smart-home preferences need a versioned, auditable model tied to the user's home/project.

### Room intelligence
`Room` currently has a coarse `RoomType`, name, area and JSON metadata. Phase 1 needs a structured room-understanding contract with confidence, user confirmation/correction state, dimensions/geometry metadata and room requirements without forcing provider-specific AI output into the core model.

### Budget model
There is no first-class budget-plan/recommendation/lock model. Phase 1 needs immutable budget decisions plus revision history and explicit distinction between estimates and verified prices.

### Product/material provenance
`CatalogueItem` and `CataloguePrice` provide a foundation, but Phase 1 needs source/provenance, verification/freshness, brand/product identifiers, media, material/specification attributes, warranty claims and recommendation rationale. Real source data must be distinguishable from Nivasa estimates and recommendations.

### Design decision/explainability
Design versions and revisions exist, but the product needs structured design decisions/recommendations so that `why this`, `why not that`, trade-offs and user overrides remain auditable and reusable by the What-If and Savings systems.

### What-If / Savings
There is no first-class simulation/savings model. Changes need deterministic deltas against a locked baseline, with reasoned impact and no floating-point monetary arithmetic.

### Smart home
There is no domain model for smart-home capabilities, scenes, device recommendations or experience states. Smart-home features must be capability-driven and provider/product neutral.

### Buildability
There is no first-class buildability assessment model. The Phase 1 engine must represent checks, evidence, warnings, unknowns and pass/needs-review outcomes without pretending that AI can validate structural facts it cannot observe.

### Visualization entitlements and experience state
Rendering/provider boundaries exist, but Phase 1 needs a product-level visualization request/entitlement model connecting a locked design to room images, home images, smart scenes and future walkthrough jobs.

### Localization and assistant
No persistent user language preference or assistant interaction contract currently exists. Localization must be independent of business logic; assistant responses must carry provenance/type where factual product claims are involved.

### Notifications
No first-class notification/preference model is part of the current product foundation. Phase 1 needs event-driven, preference-aware notifications without coupling copy to core domain logic.

### Execution
The foundation contains commercial/payment infrastructure but not a full execution project/quote/negotiation/work-progress model.

## 4. Canonical Phase 1 domain graph

```text
User
  |
  +--> Home / Property
  |      |
  |      +--> FloorPlan -> RoomUnderstanding -> Rooms
  |      |
  |      +--> HomeDNA
  |      |
  |      +--> BudgetPlan
  |      |
  |      +--> DesignProject
  |             |
  |             +--> DesignVersion -> DesignDecision[]
  |             |                       |
  |             |                       +--> Product/Material recommendations
  |             |
  |             +--> DesignRevision
  |             +--> WhatIfSimulation
  |             +--> SavingsPlan
  |             +--> BuildabilityAssessment
  |             +--> BOQ -> BOQLine -> CatalogueItem/Product
  |             +--> VisualizationRequest -> Asset
  |             +--> SmartHomePlan -> Scene
  |
  +--> Purchases -> Entitlements
  |
  +--> Notifications / Preferences
  |
  +--> Assistant sessions/messages
  |
  +--> ExecutionProjects -> Quote -> Negotiation -> Milestones -> Handover
```

## 5. Ownership boundaries

### Home Intelligence Service
Owns creation/update of the structured home model, floor-plan ingestion lifecycle, room confirmation and user corrections.

### Home DNA Service
Owns household/lifestyle/design-personality/preferences and produces a versioned Home DNA snapshot for design generation.

### Budget Service
Owns budget recommendation, user-approved budget lock, budget revisions and deterministic cost envelopes.

### Design Service
Owns design versions/revisions, design decisions and design-state transitions. It does not own catalogue truth or payment state.

### Catalogue/Product Intelligence Service
Owns product/material records, provenance, verification timestamps, media references, attributes, warranty claims and normalized price observations. It does not invent missing data.

### Recommendation Service
Consumes Home DNA + home facts + budget + product facts and produces explainable recommendations. It records the evidence/rationale used.

### Simulation/Savings Service
Computes deterministic What-If deltas and savings plans against a chosen design baseline.

### Smart Home Service
Owns capability definitions, device/product mapping and scene definitions. A scene is a design/experience intent; actual device integration remains behind adapters.

### Buildability Service
Owns deterministic checks and evidence-backed review findings. Unknown/unsupported checks are explicit `NEEDS_REVIEW`, never silently treated as pass.

### BOQ/Costing Service
Remains the authoritative monetary calculation layer. All business money uses integer minor units or Prisma Decimal, never JavaScript floating-point arithmetic.

### Visualization Service
Owns visualization requests and lifecycle. Provider adapters remain replaceable and fail honestly when unconfigured.

### Assistant/Localization Service
Owns language preference and assistant orchestration. Business services remain the source of truth; the assistant cannot bypass authorization or mutate domain state directly.

### Notification Service
Owns event-to-notification mapping, user preferences, localization and delivery state.

### Execution Service
Owns execution project state, site checks, quote versions, negotiation and milestones. Payment/entitlement remains owned by commercial services.

## 6. Data truth model

Every externally visible product-related value must be classified as exactly one of:

- **VERIFIED** — supported by a recorded source and verification/freshness timestamp.
- **ESTIMATE** — generated/calculated by Nivasa and explicitly labelled.
- **RECOMMENDATION** — Nivasa's contextual assessment, with reason/evidence references.

A missing value remains missing. The system must not turn absence into a guessed value.

## 7. Money model

- INR is the initial product currency.
- Persisted prices use minor units (`paise`) as integers where possible.
- Quantities that require fractions use Prisma Decimal.
- Taxes, discounts, wastage and margins are explicit components.
- UI never calculates authoritative totals.
- A quote/BOQ snapshot is immutable once finalized.

## 8. Async model

Long-running work follows:

```text
API request
 -> validate + authorize
 -> create durable domain/job record
 -> enqueue idempotent job
 -> worker claims job
 -> provider adapter
 -> persist result/failure
 -> emit domain event
 -> notification/UI refresh
```

The database remains authoritative for job lifecycle. Provider success is never inferred from queue completion.

## 9. API contract

Phase 1 route handlers remain thin:

```text
Route handler
 -> authentication/authorization
 -> Zod validation
 -> domain service
 -> repository/provider adapter
 -> normalized response/error
```

UI components never access Prisma directly.

Mutating endpoints must have:
- authentication
- ownership/role authorization
- Zod input validation
- idempotency where retries can duplicate business effects
- structured domain errors
- audit logging where the action is commercially/security significant

## 10. Product-state invariants

1. A design cannot be finalized without an associated project and valid owner scope.
2. A locked budget is versioned; later changes create a new decision rather than mutating history.
3. Product facts are not overwritten by AI recommendations.
4. A recommendation cannot be displayed as verified product fact.
5. A finalized BOQ is immutable; a changed design creates a new BOQ version.
6. What-If simulations never mutate the user's locked design unless explicitly applied.
7. Paid visualization/experience is entitlement-gated server-side.
8. Walkthrough/video requests reference a specific design version and experience configuration.
9. Execution quotes reference a specific locked design/BOQ snapshot.
10. User corrections to AI room understanding are authoritative for that home version.

## 11. Phase 1 implementation dependency order

```text
Home Intelligence
       ↓
Home DNA
       ↓
Budget Reality
       ↓
Design + Explainability
       ↓
Product/Material Intelligence
       ↓
What-If + Savings
       ↓
Smart Home
       ↓
Buildability + BOQ + Shop Your Home
       ↓
Localization + Assistant + Notifications
       ↓
Commercial / Visualization Entitlements
       ↓
Immersive Walkthrough
       ↓
Execution
       ↓
End-to-End Hardening
```

A later domain may expose provider adapters early for interface testing, but it must not be presented as product-complete before its upstream domain contracts are stable.

## 12. PR discipline

- One PR per delivery step/domain slice.
- PR title must identify the Phase 1 step and domain.
- No unrelated refactors.
- No temporary source-mutating CI workflow.
- Full CI chain is mandatory before merge.
- If CI fails, obtain the actual error/annotation before changing code when possible.
- Do not claim completion from local tests alone when CI has not run.
- Do not merge a PR that changes the Phase 1 contract without updating this document and issue #20 first.

## 13. Step 0 acceptance criteria

Architecture freeze is complete when:

- current Phase 0/0.1 contracts have been mapped;
- Phase 1 domains and ownership boundaries are documented;
- new data-model needs are explicit;
- monetary/provenance/state invariants are explicit;
- dependency order is frozen;
- PR/CI discipline is frozen;
- the first implementation slice can be developed without redefining Phase 1.

After this document is merged, implementation begins with **Home Intelligence + Home DNA** as the first Phase 1 delivery step.

## 14. Formatting gate

This document is intentionally maintained as plain Markdown and must pass the repository's existing formatter. Do not hand-wrap Markdown to satisfy a guessed formatter output; run the repository-pinned formatter before committing changes.
