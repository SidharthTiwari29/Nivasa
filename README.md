# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home-interior platform for India. It is designed to take a homeowner from their real property and floor plan to an exceptionally well-designed, transparent, budget-aware, purchasable and executable home.

Nivasa is not merely an AI image generator, furniture catalogue, BOQ calculator, marketplace or project-management tool. Its differentiation is the connected intelligence layer:

**Home → Space → Design → Materials → Products → Options → Deals → BOQ → Budget → Visualization → Procurement → Execution**

> **Status rule:** This README is the end-to-end product and engineering contract. It describes both implemented foundations and the target product vision. It must never be used to claim that an unfinished capability is complete.

---

# 1. North Star

The complete Nivasa journey is:

```text
REAL PROPERTY
    ↓
FLOOR PLAN / PHOTOS / USER BRIEF
    ↓
SPATIAL UNDERSTANDING
    ↓
ROOM + ELEMENT MODEL
    ↓
DESIGN INTELLIGENCE
    ↓
MULTIPLE DESIGN DIRECTIONS
    ↓
REAL MATERIALS + COMPONENTS + PRODUCTS
    ↓
MORE OPTIONS / BETTER OPTIONS / BETTER DEALS
    ↓
BOQ + COST + BUDGET CONTROL
    ↓
USER REVIEW / LOCK / REVISION
    ↓
3D / 360 / WALKTHROUGH / VIDEO
    ↓
PROCUREMENT
    ↓
EXECUTION
    ↓
QUALITY / HANDOVER
```

The product promise is:

> **Understand my home → design my home → show me my home → explain what it costs → help me choose better → help me save → help me buy → help me build it.**

---

# 2. Product Vision

Nivasa aims to reshape interior design by connecting the fragmented journey normally spread across designers, contractors, suppliers, marketplaces, product research, quotations, BOQs, visualization and execution.

The homeowner should not need to become an interior-design expert. Nivasa should provide:

- exceptional design intelligence
- transparency
- meaningful choice
- real-product intelligence
- cost and savings intelligence
- visualization
- procurement support
- execution support

The system should optimise for **design quality + practicality + transparency + value**, not merely the lowest price.

---

# 3. Non-Negotiable Principles

## Design First

Beautiful renders alone are insufficient. Designs must respect actual dimensions, proportions, circulation, ergonomics, storage, natural light, ventilation, electrical/plumbing constraints, furniture scale, kitchen workflow, wardrobe usability, lighting, materials, durability, maintenance, constructability, lifestyle and budget.

## Real Home First

The customer's actual property is the source of truth where information has been confirmed. Inputs may include floor plans, apartment layouts, room photos, dimensions, property information, lifestyle requirements, existing furniture, preferences, budget and constraints.

## Transparency First

For important decisions the homeowner should understand **what**, **why**, **price**, **source**, **freshness**, **alternatives**, **trade-offs**, **savings** and **confidence**.

## Value First

```text
CHEAPEST ≠ BEST VALUE ≠ BEST QUALITY ≠ BEST DEAL
```

A genuine deal requires evidence. Nivasa must explain trade-offs rather than blindly recommending the cheapest option.

## User Control

Users can accept, reject, compare, modify, lock, replace, downgrade, upgrade, preserve and revert important decisions. Locked decisions must not be silently changed by later AI generation.

## No Fabricated Certainty

Unknown or AI-inferred information must remain explicitly unknown/estimated with appropriate confidence until confirmed. Nivasa must never manufacture catalogue prices, availability, evidence or provider success.

---

# 4. Property and Spatial Intelligence

Nivasa must build a persistent spatial model from the customer's home information. Where supported, it should represent:

- property and floor
- rooms and boundaries
- walls and openings
- doors and windows
- dimensions
- circulation
- fixed architectural elements
- electrical/plumbing constraints
- known structural constraints
- usable zones
- furniture/storage/lighting zones
- confidence and uncertainty

The target workflow is:

```text
UPLOAD FLOOR PLAN
      ↓
PLAN ANALYSIS
      ↓
ROOM / WALL / DOOR / WINDOW DETECTION
      ↓
DIMENSION EXTRACTION
      ↓
SPATIAL MODEL
      ↓
DESIGN SYSTEM
```

Incorrect geometry can corrupt design, product selection, BOQ, visualization and execution, so spatial uncertainty must be explicit.

---

# 5. Exceptional Interior Designer Capability

A core product vision is that when a customer uploads their apartment layout, Nivasa should be capable of acting like an exceptionally strong interior designer grounded in that actual home.

It should reason about:

- space planning
- furniture placement
- circulation
- proportions
- storage
- lighting
- colour and texture
- kitchens
- wardrobes
- TV/storage units
- utility spaces
- living rooms
- bedrooms
- bathrooms
- dining
- balconies
- study/home office
- children's rooms
- elderly-friendly requirements
- smart-home requirements
- budget and constructability

Nivasa should be able to challenge a poor decision rather than blindly follow it:

```text
USER REQUEST
    ↓
DESIGN ANALYSIS
    ↓
ISSUE / TRADE-OFF DETECTED
    ↓
EXPLANATION
    ↓
BETTER ALTERNATIVES
    ↓
USER DECISION
```

---

# 6. Multiple Designs and User-Controlled Revisions

Users should receive multiple strong design directions rather than one AI output. Examples include:

- Luxury
- Premium
- Smart Luxury
- Value
- Budget
- Minimal
- Modern
- Contemporary
- Warm
- Low-maintenance
- Personalised
- user-defined combinations

Different rooms can have different economic strategies, for example:

```text
PREMIUM KITCHEN + VALUE LIVING + CUSTOM BEDROOM + BUDGET UTILITY
```

Every important design change should be versioned and traceable:

- what changed
- why
- who
- when
- previous value
- replacement
- BOQ impact
- budget impact
- visualization impact
- procurement impact

---

# 7. Interior Intelligence Graph

Nivasa must model the interior world rather than treating products as isolated rows.

Canonical entities include:

- Product
- Material
- Component
- Assembly
- Service
- Brand
- Manufacturer
- Seller
- Design Element

Important relationships include:

```text
ALTERNATIVE_TO
COMPATIBLE_WITH
PART_OF
USES_MATERIAL
SOLD_BY
MANUFACTURED_BY
BRANDED_AS
SUITABLE_FOR
REQUIRES_SERVICE
```

Example:

```text
WARDROBE
 ├─ CARCASS
 │   └─ BOARD
 ├─ SHUTTER
 │   └─ LAMINATE / VENEER / ACRYLIC
 ├─ HINGES
 ├─ CHANNELS
 ├─ HANDLES
 ├─ LIGHTING
 ├─ ACCESSORIES
 └─ CARPENTRY / INSTALLATION
```

This graph connects design decisions to real materials, products, services, costs and execution.

---

# 8. Interior Scope

The long-term Nivasa universe covers:

### Furniture
Sofas, beds, tables, chairs, dining furniture, side tables, TV units and storage.

### Modular Interior
Kitchens, wardrobes, vanity units, TV units, study units, storage and utility units.

### Materials
Plywood, MDF, HDF, particle board, laminates, acrylic, veneer, PU, paint, texture, wallpaper, glass, stone, tiles and countertops.

### Hardware
Hinges, drawer channels, lift-up systems, handles, baskets, organisers, locks and accessories.

### Lighting and Electrical
Ceiling lights, spotlights, profile lighting, pendants, wall lights, cabinet lighting, switches, sockets and smart switches.

### Plumbing and Appliances
Faucets, sinks, sanitaryware, shower systems, refrigerators, ovens, microwaves, dishwashers, hobs, chimneys, washing machines, dryers, ACs and TVs.

### Soft Furnishing and Decor
Curtains, blinds, rugs, cushions, upholstery, mirrors, artwork, plants and decorative objects.

### Smart Home
Smart lighting, sensors, locks, automation, security and connected devices.

### Execution
Carpentry, electrical, plumbing, painting, fabrication, false ceiling, installation, delivery, assembly and site execution.

The taxonomy must remain extensible.

---

# 9. Source → Evidence → Canonical Entity

Nivasa must never treat scraped, imported or supplied information as automatically authoritative.

```text
SOURCE
  ↓
GOVERNED SOURCE ADAPTER
  ↓
RAW RECORD
  ↓
NORMALIZATION
  ↓
OBSERVATION
  ↓
EVIDENCE / PROVENANCE
  ↓
CANONICAL ENTITY
  ↓
VARIANT / SKU
  ↓
MARKET OBSERVATION
  ↓
PROJECT INTELLIGENCE
```

Market observations should retain, where available:

- source identity
- source reference
- external ID
- observed timestamp
- verification timestamp
- geography
- currency
- price/MRP
- availability
- seller
- evidence reference
- confidence
- freshness

A source name alone is not evidence.

---

# 10. Canonical Products and Variants

The same product can appear across many sources. Nivasa should resolve duplicate observations to a canonical product while preserving meaningful variants.

```text
SOURCE A → PRODUCT X → ₹12,999
SOURCE B → PRODUCT X → ₹11,499
SOURCE C → PRODUCT X → ₹13,499
             ↓
       CANONICAL PRODUCT X
             ↓
     OBSERVATIONS / HISTORY
```

Variants remain distinct when size, finish, colour, material, capacity, specification, model or SKU changes meaningfully.

---

# 11. More Options

Nivasa should provide significantly more useful choices across:

- premium
- mid-range
- value
- budget
- brands
- local suppliers
- custom-made alternatives
- materials
- finishes
- sellers

The system must group and rank options intelligently rather than overwhelm users with duplicate listings.

---

# 12. Better Options

Nivasa should identify better options using evidence-backed signals such as:

- quality
- compatibility
- durability
- design fit
- maintenance
- confidence
- budget fit
- availability
- service
- warranty
- project compatibility

Potential labels include:

- Premium
- Best Overall
- Smart Buy
- Best Value
- Budget Pick
- Deal

Every important label should be explainable.

---

# 13. Better Deals and Savings Intelligence

Nivasa must distinguish a genuine deal from a marketing discount.

Deal intelligence may use:

- observed price
- reference price
- price history
- same-SKU comparison
- equivalent-specification comparison
- seller
- geography
- availability
- evidence quality

Examples:

```text
SAME SKU CHEAPER ELSEWHERE
₹14,999 → ₹12,499 → POTENTIAL SAVING ₹2,500

EQUIVALENT SPECIFICATION
₹18,000 → ₹14,500 → POTENTIAL SAVING ₹3,500

UPGRADE ANALYSIS
₹15,000 → ₹17,000 → EXTRA ₹2,000 → BETTER WARRANTY / DURABILITY
```

Local/custom alternatives should also be considered where appropriate, with quality and execution trade-offs clearly shown.

---

# 14. Substitution and Project-Level Optimization

A major Nivasa capability is intelligent substitution:

```text
CURRENT CHOICE
      ↓
ALTERNATIVE
      ↓
PRICE DIFFERENCE
      ↓
SAVING
      ↓
QUALITY / PERFORMANCE IMPACT
      ↓
DESIGN / MAINTENANCE IMPACT
      ↓
USER DECISION
```

The system should eventually optimise the whole project, not just individual products.

Example:

```text
ORIGINAL PROJECT  ₹12,50,000
OPTIMIZED PROJECT ₹10,90,000
POTENTIAL SAVING   ₹1,60,000
```

Savings should be explainable by category and must not silently compromise protected decisions.

---

# 15. Design-to-Product Grounding

When procurement is promised, visual design should connect to real entities whenever possible:

```text
DESIGN ELEMENT
      ↓
COMPONENT / ASSEMBLY
      ↓
MATERIAL
      ↓
PRODUCT / SKU
      ↓
SELLER / SERVICE
      ↓
PRICE / AVAILABILITY
```

If an AI visual contains a concept that cannot currently be sourced, it must be clearly labelled as illustrative. AI-generated imaginary products must never silently appear as real catalogue products.

---

# 16. Materials, Components and Assemblies

The middle layer between design and catalogue is essential.

For example, a kitchen can be represented as:

```text
KITCHEN
 ├─ CABINET
 │   ├─ CARCASS
 │   ├─ SHUTTER
 │   ├─ HINGES
 │   ├─ DRAWERS
 │   ├─ CHANNELS
 │   └─ ACCESSORIES
 ├─ COUNTERTOP
 ├─ SINK
 ├─ FAUCET
 ├─ LIGHTING
 └─ APPLIANCES
```

Material intelligence should support evidence-backed attributes such as grade, thickness, construction, moisture resistance, load capacity, durability, finish, application suitability, maintenance and compatibility.

---

# 17. BOQ and Cost Intelligence

The BOQ is a living projection of the design:

```text
DESIGN
  ↓
MATERIALS
  ↓
COMPONENTS
  ↓
PRODUCTS
  ↓
QUANTITIES
  ↓
PRICES
  ↓
LABOUR / SERVICES
  ↓
TOTAL
```

It should support:

- room-wise items
- material/component/product lines
- quantities and units
- persisted catalogue rates
- labour and services
- taxes where applicable
- alternatives
- approved selections
- budget allocation
- versioning
- change impact
- project totals
- exports

Deterministic costing must use persisted catalogue/market data. No fabricated catalogue prices.

---

# 18. Budget Intelligence

Nivasa should continuously answer:

- What will this design cost?
- What is driving the cost?
- Which room consumes the most budget?
- Where can I save?
- What happens if I upgrade this?
- What happens if I downgrade this?
- What should I never compromise?
- How much can I save without materially damaging the design?

Example:

```text
CURRENT ₹14,80,000
TARGET  ₹12,50,000
GAP       ₹2,30,000
```

The system should find intelligent substitutions rather than simply remove random requirements.

---

# 19. Revision Impact Engine

Important changes must propagate through the connected project graph.

```text
USER CHANGES MATERIAL
        ↓
DESIGN REVISION
        ↓
MATERIAL / PRODUCT
        ↓
BOQ
        ↓
PRICE
        ↓
BUDGET
        ↓
VISUALIZATION
        ↓
PROCUREMENT
```

Nivasa should be able to tell the user what downstream objects are affected.

Example:

> Changing this countertop affects 2 BOQ items, changes the estimated budget and requires regeneration of the kitchen visualization.

---

# 20. Visualization — Signature Nivasa Experience

Visualization is a core product capability, not decoration.

Target capabilities include:

- photorealistic images
- consistent camera views
- before/after
- panorama
- 360°
- 3D scenes
- immersive walkthroughs
- video
- actual-apartment visualization

The signature experience is:

> **Upload your actual apartment layout and see that exact apartment transformed according to your selected design.**

The target flow is:

```text
CUSTOMER'S ACTUAL HOME
        ↓
LAYOUT
        ↓
ROOMS
        ↓
DESIGN
        ↓
REAL MATERIALS / PRODUCTS
        ↓
BOQ / COST
        ↓
3D / 360 / WALKTHROUGH
        ↓
VIDEO OF THEIR HOME
```

The experience should feel like **"This is my apartment"**, not a generic room inspired by the request.

---

# 21. Procurement

The long-term procurement journey is:

```text
APPROVED DESIGN
      ↓
APPROVED BOQ
      ↓
SUPPLIER / SELLER OPTIONS
      ↓
RFQ
      ↓
QUOTE COMPARISON
      ↓
ORDER
      ↓
DELIVERY
```

The system should preserve relationships among selected items, suppliers, prices, quantities, approved BOQ and orders.

---

# 22. Execution

The product should ultimately continue beyond procurement:

```text
APPROVED DESIGN
      ↓
APPROVED BOQ
      ↓
PROCUREMENT
      ↓
DELIVERY
      ↓
INSTALLATION
      ↓
SITE EXECUTION
      ↓
QUALITY CHECK
      ↓
SNAGGING
      ↓
CORRECTIONS
      ↓
HANDOVER
```

Execution services are first-class concepts: carpentry, electrical, plumbing, painting, fabrication, false ceiling, installation, assembly, delivery and site work.

---

# 23. Collaboration and Auditability

Nivasa should support controlled collaboration among homeowner, designer, admin and procurement/execution participants.

Important objects require versioning and approval:

- floor plans
- designs
- revisions
- materials
- products
- BOQs
- quotations
- commercial proposals
- changes

Approvals must be attributable, timestamped and auditable.

---

# 24. AI Architecture

AI providers must remain behind provider-neutral contracts.

AI capabilities include:

- floor-plan analysis
- spatial understanding
- design generation
- design revision
- product/material grounding
- BOQ assistance
- recommendations
- explanations
- visualization prompting
- walkthrough generation
- video prompting

AI output is not authoritative merely because an AI model generated it.

```text
AI OUTPUT
    ↓
VALIDATION
    ↓
PROJECT DATA + GEOMETRY + CATALOGUE + EVIDENCE
    ↓
TRUSTED RESULT
```

---

# 25. Durable AI Jobs

Asynchronous AI jobs must support:

- durable state
- idempotency
- retries
- exponential backoff
- explicit failure states
- provider error handling
- worker lifecycle
- observability
- no fabricated success

If a provider fails:

```text
PROVIDER FAILURE
      ↓
EXPLICIT FAILURE
      ↓
RETRY / RECOVERY
```

Never convert provider failure into fake success.

---

# 26. Security and Authorization

Production boundaries include:

- Auth.js authentication
- persisted roles
- server-side authorization
- owner-scoped access
- validated inputs
- structured API errors
- audit logging
- secure signed storage
- security headers
- safe failure behaviour

Roles include:

```text
USER
DESIGNER
ADMIN
SUPER_ADMIN
```

Authorization must happen server-side.

---

# 27. Commercial Architecture

Nivasa is intended to be a real commercial product.

The commercial system should support:

- server-owned package definitions
- feature gating
- entitlement enforcement
- server-created payment orders
- Razorpay integration for India
- signed webhook verification
- idempotent purchase activation
- transactional entitlement state
- concurrency protection
- reserve/confirm/release semantics

The frontend must never independently activate paid entitlements. Server-side state is authoritative.

---

# 28. Persistent Project Model

The core project relationship is:

```text
PROPERTY
  ↓
ROOM
  ↓
FLOOR PLAN / SPATIAL MODEL
  ↓
DESIGN PROJECT
  ↓
VERSION
  ↓
REVISION
  ↓
DESIGN ELEMENTS
  ↓
MATERIALS / COMPONENTS / PRODUCTS
  ↓
BOQ / COST
  ↓
PROCUREMENT
  ↓
EXECUTION
```

Market intelligence connects through:

```text
SOURCE
  ↓
OBSERVATION
  ↓
EVIDENCE
  ↓
CANONICAL ENTITY / SKU
  ↓
PRICE / AVAILABILITY / SELLER
  ↓
RECOMMENDATION
  ↓
PROJECT
  ↓
BOQ
```

This connected model is the foundation of the product moat.

---

# 29. Phase 0 — Production Foundation

Phase 0 establishes repository conventions, authentication, authorization, property/room/floor-plan persistence, storage, design lifecycle, validation, auditability, AI jobs, provider contracts, rendering contracts, commercial foundations, entitlements and CI.

---

# 30. Phase 0.1 — Production Foundation Acceptance

Phase 0.1 establishes the production-grade server foundation required by the product contract, including:

- Auth.js boundaries and persisted roles
- server-side authorization
- Zod validation
- repository/service boundaries
- structured errors
- environment validation
- owner-scoped property, room and floor-plan persistence
- secure signed storage
- design project/version/revision lifecycle
- durable AI jobs and worker lifecycle
- provider-neutral AI contracts
- rendering contracts
- payment orders
- webhook verification
- entitlements
- catalogue services
- deterministic BOQ/costing
- security
- operational documentation
- CI

Phase completion requires implementation, tests, integration, authorization, data integrity, CI, documentation and an end-to-end gap audit. Existence of files or a green compile alone is insufficient.

---

# 31. Step 2 — Interior Intelligence Acceptance Contract

Step 2 is not merely a catalogue table. Its acceptance chain is:

```text
SOURCE
   ↓
GOVERNED ADAPTER
   ↓
RAW RECORD
   ↓
NORMALIZATION
   ↓
EVIDENCE
   ↓
CANONICAL ENTITY
   ↓
VARIANT / SKU
   ↓
CROSS-SOURCE MATCH
   ↓
PRICE / AVAILABILITY HISTORY
   ↓
MORE OPTIONS
   ↓
BETTER OPTIONS
   ↓
BETTER DEALS
   ↓
PROJECT COMPATIBILITY
   ↓
BOQ / BUDGET IMPACT
   ↓
EXPLAINABLE RECOMMENDATION
```

Step 2 acceptance must cover:

### Source
- source identity
- governed source adapter
- source eligibility

### Observation
- raw observation
- normalized observation
- timestamps
- geography
- provenance

### Evidence
- evidence reference
- confidence
- freshness
- verification

### Canonical Identity
- canonical product
- variant handling
- SKU identity
- cross-source matching

### Market Intelligence
- prices
- price history
- availability
- sellers
- geography

### Recommendation
- More Options
- Better Options
- Better Deals
- alternatives
- substitutions
- trade-offs
- project compatibility

### Project Integration
- design linkage
- BOQ linkage
- budget impact
- revision impact

### Transparency
The customer must be able to understand why an important recommendation is being made.

---

# 32. Phase 1 — Product Capability Build

The intended dependency order is:

```text
1. PROPERTY / LAYOUT INTELLIGENCE
        ↓
2. DESIGN INTELLIGENCE
        ↓
3. INTERIOR INTELLIGENCE
        ↓
4. MORE / BETTER / DEAL INTELLIGENCE
        ↓
5. BOQ / BUDGET INTELLIGENCE
        ↓
6. VISUALIZATION
        ↓
7. PROCUREMENT / EXECUTION
        ↓
8. COMMERCIAL PACKAGING
```

No phase should claim completion by absorbing future-phase functionality without explicit acceptance.

---

# 33. Testing and CI

The authoritative verification chain is:

```text
FORMAT CHECK
     ↓
LINT
     ↓
PRISMA GENERATE
     ↓
TYPECHECK
     ↓
TESTS
     ↓
PRISMA VALIDATE
     ↓
PRODUCTION BUILD
     ↓
GIT DIFF CHECK
```

Run locally:

```bash
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

Tests must cover both happy paths and security/data-integrity boundaries.

---

# 34. Testing the Interior Intelligence Layer

Tests should cover:

- source eligibility
- normalization
- canonical identity
- variants and SKUs
- evidence and provenance
- observation persistence
- price history
- availability
- cross-source identity
- seller comparison
- value ranking
- deal ranking
- substitutions
- trade-offs
- project compatibility
- BOQ impact
- budget impact
- authorization
- owner isolation

---

# 35. Testing Design Intelligence

Tests should cover:

- floor-plan validation
- spatial inputs
- room persistence
- design persistence
- versioning
- revisions
- locked decisions
- design-to-product grounding
- downstream cost impact
- uncertain geometry
- authorization
- owner isolation

---

# 36. Security and Commercial Testing

Tests must include:

- unauthorized access
- cross-user access
- role enforcement
- ownership checks
- webhook verification
- idempotent payments
- entitlement activation
- entitlement concurrency
- replay protection
- malformed inputs
- invalid state transitions

---

# 37. Operations and Provider Boundaries

See:

- `ARCHITECTURE.md`
- `DEVELOPMENT.md`
- `docs/OPERATIONS.md`

These should document provider configuration, migration policy, queue/worker operation, payment webhooks, security, deployment assumptions and failure behaviour.

Provider integrations are real boundaries. Missing credentials must produce explicit configuration errors. Redis is required when asynchronous jobs are submitted or a worker is started. Production credentials must never be committed.

---

# 38. Product Intelligence Loop

The long-term intelligence loop is:

```text
USER
 ↓
PROPERTY
 ↓
SPATIAL MODEL
 ↓
DESIGN
 ↓
PRODUCT / MATERIAL
 ↓
PRICE / MARKET DATA
 ↓
BOQ
 ↓
BUDGET
 ↓
USER FEEDBACK
 ↓
DESIGN REVISION
 ↓
BETTER RECOMMENDATION
 ↓
BETTER VALUE
```

The platform should become more useful as product knowledge, material knowledge, design knowledge, market observations, project history and execution knowledge grow.

---

# 39. Long-Term Competitive Moat

The moat is not a single AI model. It is the combination of:

```text
SPATIAL INTELLIGENCE
        +
DESIGN INTELLIGENCE
        +
INTERIOR KNOWLEDGE GRAPH
        +
PRODUCT / MATERIAL DATA
        +
SOURCE EVIDENCE
        +
PRICE INTELLIGENCE
        +
BOQ INTELLIGENCE
        +
PROJECT HISTORY
        +
VISUALIZATION
        +
PROCUREMENT
        +
EXECUTION
```

The connected graph becomes increasingly difficult to replicate as Nivasa accumulates trustworthy knowledge and project history.

---

# 40. Source Scale Target

Nivasa may ultimately support a broad India-relevant source universe, potentially **500+ legitimate sources** across manufacturers, brands, retailers, marketplaces, dealers, distributors, local suppliers and service providers.

500+ is an implementation-scale target, not a product definition. Quality matters more than count. A source must have eligibility, governed ingestion, provenance, freshness, normalization, canonical identity and evidence handling. Listing a source does not imply that its data is automatically ingestible or trustworthy.

---

# 41. No-Premature-Closure Rule

A phase or step must never be closed merely because:

- code compiles
- CI is green
- a Prisma migration exists
- a model exists
- an API exists
- a UI exists
- a provider contract exists
- a source registry exists
- a small product subset exists

Acceptance requires:

```text
IMPLEMENTATION
+
TESTS
+
SECURITY
+
AUTHORIZATION
+
DATA INTEGRITY
+
INTEGRATION
+
CI
+
DOCUMENTATION
+
END-TO-END GAP AUDIT
```

The repository must always distinguish **IMPLEMENTED** from **VISION / TARGET**.

---

# 42. Current Repository Foundation

The repository currently contains the production-foundation work around authentication/authorization, validation, property and room persistence, floor plans, secure storage, design lifecycle, durable AI jobs, provider-neutral contracts, commercial/entitlement foundations, catalogue and deterministic BOQ/costing, security and CI.

The exact implementation status of Step 2 and later product capabilities must be determined from the current merged code, tests, CI, migrations, PR state and acceptance audit rather than from this README alone.

This README intentionally preserves the complete vision so implementation does not gradually lose product scope.

---

# 43. Engineering Philosophy

Nivasa must be built as a production-grade startup platform, not as a collection of demos.

Every feature should be evaluated for:

- correctness
- reliability
- security
- scalability
- maintainability
- observability
- data integrity
- user trust
- commercial viability
- real-world usefulness

Prefer:

- canonical entities
- explicit state transitions
- versioned history where appropriate
- deterministic calculations
- evidence-backed intelligence
- provider abstraction
- server-authoritative state
- strong validation
- comprehensive tests
- auditable decisions

Avoid temporary shortcuts that create structural debt in the core project graph.

---

# 44. Final Product Promise

```text
I UPLOAD MY HOME
        ↓
NIVASA UNDERSTANDS MY SPACE
        ↓
NIVASA UNDERSTANDS MY REQUIREMENTS
        ↓
NIVASA DESIGNS MY HOME
        ↓
I GET MULTIPLE GREAT OPTIONS
        ↓
I CAN MODIFY AND LOCK WHAT I WANT
        ↓
NIVASA CONNECTS THE DESIGN TO REAL PRODUCTS
        ↓
I SEE MORE OPTIONS
        ↓
I SEE BETTER OPTIONS
        ↓
I SEE BETTER DEALS
        ↓
NIVASA EXPLAINS THE TRADE-OFFS
        ↓
NIVASA BUILDS MY BOQ
        ↓
NIVASA EXPLAINS MY COST
        ↓
NIVASA FINDS SAVINGS
        ↓
I SEE MY ACTUAL APARTMENT
        ↓
3D / 360 / WALKTHROUGH / VIDEO
        ↓
I APPROVE
        ↓
NIVASA HELPS ME PROCURE
        ↓
NIVASA SUPPORTS EXECUTION
        ↓
MY HOME GETS BUILT
```

The goal is not simply to generate beautiful interiors.

The goal is to fundamentally reshape how people:

**understand → design → compare → choose → budget → visualize → buy → build their homes.**

---

# 45. Nivasa

**Your home. Designed your way.**

**Understand it. Design it. Compare it. Optimize it. Visualize it. Buy it. Build it.**
