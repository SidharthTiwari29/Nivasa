# Nivasa

**Your home. Designed your way.**

Nivasa is an AI-native home-interior platform for India. It takes a homeowner from their real property and floor plan to an exceptionally well-designed, transparent, budget-aware, purchasable and executable home.

Nivasa is not merely an AI image generator, furniture catalogue, BOQ calculator, marketplace or project-management tool. Its differentiation is the connected intelligence layer:

**Home → Space → Design → Materials → Products → Options → Deals → BOQ → Budget → Visualization → Procurement → Execution**

> **Status rule:** This README is the end-to-end product and engineering contract. It describes the agreed vision and implementation foundations. It must never be used to claim that an unfinished capability is complete.

---

# 1. North Star

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

Product promise:

> **Understand my home → design my home → show me my home → explain what it costs → help me choose better → help me save → help me buy → help me build it.**

---

# 2. Product Vision

Nivasa connects the fragmented journey normally spread across designers, contractors, suppliers, manufacturers, marketplaces, product research, quotations, BOQs, visualization and execution.

The homeowner should not need to become an interior-design expert. Nivasa should provide:

- exceptional design intelligence
- transparency
- meaningful choice
- real-product and material intelligence
- cost and savings intelligence
- visualization
- procurement support
- execution support
- an auditable project history

The system optimizes for **design quality + practicality + transparency + value**, not merely the lowest price.

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
- electrical and plumbing constraints
- known structural constraints
- usable zones
- furniture, storage and lighting zones
- confidence and uncertainty

Target workflow:

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

# 5. Layout Upload and Exceptional Interior Designer Capability

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

Nivasa should challenge a poor decision rather than blindly follow it:

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

The long-term signature experience is: **upload the customer's actual apartment layout and see that exact apartment transformed according to the selected design.**

---

# 6. Multiple Designs and User-Controlled Revisions

Users should receive multiple strong design directions rather than one AI output:

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

Different rooms can use different economic strategies:

```text
PREMIUM KITCHEN + VALUE LIVING + CUSTOM BEDROOM + BUDGET UTILITY
```

Important design decisions must be versioned and traceable:

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

Nivasa models the interior world rather than treating products as isolated rows.

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

Relationships include:

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
 ├─ CARCASS → BOARD
 ├─ SHUTTER → LAMINATE / VENEER / ACRYLIC
 ├─ HINGES
 ├─ CHANNELS
 ├─ HANDLES
 ├─ LIGHTING
 ├─ ACCESSORIES
 └─ CARPENTRY / INSTALLATION
```

---

# 8. Interior Scope

The long-term universe covers:

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

# 11. Source Universe and 500+ Source Target

The long-term target is a broad India-relevant source universe that may include manufacturers, brands, retailers, marketplaces, dealers, distributors, local suppliers and service providers.

A **500+ legitimate source target** is an implementation-scale ambition, not the definition of product quality. Quality matters more than count.

A source must have, as applicable:

- eligibility
- governed ingestion
- provenance
- freshness
- normalization
- canonical identity
- evidence handling

A source appearing in a registry does not automatically mean its data is ingestible.

---

# 12. More Options

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

# 13. Better Options

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

Potential labels include Premium, Best Overall, Smart Buy, Best Value, Budget Pick and Deal. Important labels must be explainable.

---

# 14. Better Deals and Savings Intelligence

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

# 15. Substitution Intelligence

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

Nivasa should explain what changes, what remains unchanged, the expected quality difference, maintenance difference, durability difference and visual impact.

---

# 16. Project-Level Optimization

Nivasa should eventually optimize the entire interior project, not merely one product.

```text
ORIGINAL PROJECT  ₹12,50,000
OPTIMIZED PROJECT ₹10,90,000
POTENTIAL SAVING   ₹1,60,000
```

Savings should be explainable by category and must not silently compromise protected decisions.

Example:

```text
₹45,000 → kitchen materials
₹30,000 → wardrobe hardware
₹20,000 → lighting
₹25,000 → furniture
₹30,000 → supplier comparison
```

---

# 17. Materials, Components and Assemblies

The layer between design and catalogue is critical.

```text
KITCHEN
 ├─ Cabinet
 │   ├─ Carcass
 │   ├─ Shutter
 │   ├─ Hinges
 │   ├─ Drawers
 │   ├─ Channels
 │   └─ Accessories
 ├─ Countertop
 ├─ Sink
 ├─ Faucet
 ├─ Lighting
 └─ Appliances
```

Material intelligence should support evidence-backed attributes such as grade, thickness, construction, moisture resistance, load capacity, durability, finish, application suitability, maintenance and compatibility.

---

# 18. Design-to-Product Grounding

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

If a visual object is only an AI-generated concept and cannot currently be sourced, it must be clearly identified as illustrative. It must never silently appear to be a real catalogue product.

---

# 19. BOQ

The BOQ is a living projection of:

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
LABOUR
  ↓
SERVICES
  ↓
TOTAL
```

BOQ must support room-wise items, material/component/product line items, quantities, units, persisted catalogue rates, labour, services, taxes where applicable, commercial adjustments, alternatives, approved selections, budget allocation, versioning, change impact, project totals and exports.

Deterministic costing must use persisted catalogue/market data. No fabricated catalogue prices.

---

# 20. Budget Intelligence

Nivasa should continuously answer:

- What will this design cost?
- What is driving the cost?
- Which room consumes the most budget?
- Where can I save?
- What happens if I upgrade this?
- What happens if I downgrade this?
- What should I never compromise?
- How much can I save without materially affecting the design?

Example:

```text
CURRENT ₹14,80,000
TARGET  ₹12,50,000
GAP      ₹2,30,000
```

The system should find intelligent savings rather than randomly removing items.

---

# 21. Revision Impact Engine

Every important change should propagate through connected project objects:

```text
USER CHANGES LAMINATE
        ↓
DESIGN REVISION
        ↓
MATERIAL
        ↓
PRODUCT
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

Nivasa should identify affected downstream objects and explain the impact.

Example:

> Changing this countertop will affect 2 BOQ items, reduce the estimated budget by ₹18,000 and require regeneration of the kitchen visualization.

---

# 22. Visualization

Visualization is a core experience, not decoration.

Target capabilities include:

- photorealistic images
- consistent camera views
- before/after
- panorama
- 360°
- 3D scene
- immersive walkthrough
- video
- actual-apartment visualization

The signature experience is:

> **A customer uploads their actual apartment layout and sees that exact apartment transformed according to the selected design.**

The output should feel like **“This is my apartment”**, not a generic room inspired by the request.

---

# 23. Procurement

Nivasa must eventually connect approved design decisions to purchasing:

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

The system should preserve the relationship between selected item, supplier, price, quantity, approved BOQ and order/delivery.

---

# 24. Execution

The product journey does not end after procurement.

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

Execution services should be first-class entities: carpentry, electrical, plumbing, painting, fabrication, false ceiling, installation, assembly and site work.

---

# 25. Collaboration and Approvals

Nivasa should support controlled collaboration among:

- homeowner
- designer
- admin
- procurement participants
- execution participants

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

Approvals should be timestamped, attributable and auditable.

---

# 26. AI Architecture

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

# 27. AI Job Architecture

Asynchronous AI jobs must support:

- durable job state
- idempotency
- retries
- exponential backoff
- explicit failure states
- provider error handling
- worker lifecycle
- observability
- no fabricated success

If a provider is unavailable:

```text
PROVIDER UNAVAILABLE
        ↓
EXPLICIT FAILURE
        ↓
RETRY / RECOVERY
```

Never convert provider failure into fake success.

---

# 28. Security

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

Roles include User, Designer, Admin and Super Admin. Authorization must happen server-side.

---

# 29. Commercial Architecture

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

# 30. Persistent Project Model

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

This prevents isolated feature silos.

---

# 31. Phase 0 — Production Foundation

Phase 0 establishes:

- repository conventions
- authentication
- authorization
- property persistence
- room persistence
- floor-plan persistence
- storage
- design lifecycle
- validation
- auditability
- AI jobs
- provider contracts
- rendering contracts
- commercial foundations
- entitlement foundations
- CI

---

# 32. Phase 0.1 — Production Foundation Completion

Phase 0.1 establishes the production-grade server foundation required by the product contract:

- Auth.js boundaries
- roles
- authorization
- Zod validation
- repository/service boundaries
- structured errors
- owner-scoped property persistence
- room persistence
- floor-plan persistence
- secure signed storage
- design project/version/revision lifecycle
- durable AI jobs
- worker lifecycle
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

Phase 0.1 must not be declared complete merely because files exist. Acceptance requires implementation, tests, integration, authorization, data integrity, CI, documentation and a gap audit.

---

# 33. Step 1 — Property and Design Intelligence

Step 1 establishes the homeowner's real-home foundation:

```text
PROPERTY
  ↓
FLOOR PLAN
  ↓
SPATIAL MODEL
  ↓
ROOMS / ELEMENTS
  ↓
DESIGN PROJECT
  ↓
DESIGN VERSIONS / REVISIONS
```

Acceptance must prove that real user-owned property and spatial information can safely flow into the design lifecycle without cross-user access or fabricated certainty.

---

# 34. Step 2 — Interior Intelligence

Step 2 is significantly more than creating a catalogue table.

The acceptance chain is:

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

Step 2 must establish the foundations necessary to connect market intelligence to layouts, rooms, designs, revisions, materials, products, BOQ and budget.

---

# 35. Step 2 Acceptance Criteria

Step 2 is **not complete** when:

- a source registry exists
- a catalogue table exists
- a few products exist
- an API returns mock data
- a schema compiles
- tests only cover happy paths

Step 2 requires:

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
- validation

### Canonical Identity
- canonical product
- variants
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
The customer must understand:

> **Why is this recommendation being made?**

---

# 36. Testing Requirements

The authoritative CI chain is:

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

Recommended local gate:

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

---

# 37. Market Intelligence Testing

Tests must cover:

- source eligibility
- normalization
- canonical identity
- variant handling
- SKU identity
- evidence confidence
- provenance
- observation persistence
- price history
- availability
- cross-source identity
- seller comparison
- value ranking
- deal ranking
- substitution
- trade-offs
- project compatibility
- BOQ impact
- budget impact

---

# 38. Design Intelligence Testing

Tests must cover:

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

# 39. Security and Commercial Testing

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

# 40. Operations

Operational documentation should cover:

- provider configuration
- migration policy
- queue/worker operation
- Redis requirements
- payment webhook handling
- security
- deployment
- failure behaviour
- operational recovery

Provider integrations are real boundaries. Missing credentials must produce explicit configuration errors. Redis is required when asynchronous jobs are submitted or a worker is started. Never commit production credentials.

---

# 41. Transparency Contract

For every important recommendation, Nivasa should be able to show, where applicable:

```text
WHAT IS IT?
WHY IS IT RECOMMENDED?
WHAT DOES IT COST?
WHERE DID THE INFORMATION COME FROM?
WHEN WAS IT VERIFIED?
IS IT AVAILABLE?
WHAT ARE THE ALTERNATIVES?
WHAT DO I SAVE?
WHAT DO I GIVE UP?
HOW CONFIDENT IS NIVASA?
```

This is a product requirement, not merely a UI preference.

---

# 42. Affordability and Value Contract

Nivasa should continuously search for ways to improve value without degrading the design blindly.

The optimization order is:

```text
PROTECT USER NON-NEGOTIABLES
        ↓
PRESERVE DESIGN INTENT
        ↓
COMPARE EQUIVALENT OPTIONS
        ↓
IDENTIFY BETTER VALUE
        ↓
IDENTIFY REAL DEALS
        ↓
IDENTIFY SAFE SUBSTITUTIONS
        ↓
SHOW SAVINGS + TRADE-OFFS
        ↓
USER APPROVAL
```

The goal is **affordable excellence**, not cheap interiors.

---

# 43. Design Quality Contract

Nivasa's design engine should evaluate designs against:

- spatial fit
- circulation
- proportion
- ergonomics
- storage efficiency
- lighting
- material harmony
- colour harmony
- functionality
- maintenance
- durability
- constructability
- budget
- lifestyle

A design that looks good but fails practical constraints is not an exceptional Nivasa design.

---

# 44. Actual-Apartment Visualization Contract

The visualization system must preserve spatial truth as far as the available evidence permits.

The target flow is:

```text
CUSTOMER LAYOUT
      ↓
SPATIAL MODEL
      ↓
DESIGN
      ↓
REAL MATERIALS / PRODUCTS
      ↓
CONSISTENT SCENE
      ↓
RENDER
      ↓
360° / WALKTHROUGH
      ↓
VIDEO
```

Generated imagery must not be presented as measured reality when geometry is uncertain.

---

# 45. Project Change Contract

A project change must be treated as a connected state transition.

Example:

```text
USER REQUEST
      ↓
VALIDATE
      ↓
CREATE REVISION
      ↓
UPDATE DESIGN
      ↓
RECALCULATE MATERIALS / PRODUCTS
      ↓
RECALCULATE BOQ
      ↓
RECALCULATE BUDGET
      ↓
FLAG VISUALIZATION CHANGES
      ↓
FLAG PROCUREMENT CHANGES
      ↓
USER APPROVAL
```

No downstream object should silently remain stale when the system knows it is affected.

---

# 46. Data Integrity Contract

Canonical project data must remain authoritative for:

- identity
- ownership
- approved design state
- locked decisions
- BOQ quantities
- persisted catalogue prices
- payment/entitlement state
- approvals

AI output, UI state, scraped observations and external provider responses are inputs or evidence—not automatic authority.

---

# 47. Engineering Philosophy

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
- immutable/versioned history where appropriate
- deterministic calculations
- evidence-backed intelligence
- provider abstraction
- server-authoritative state
- strong validation
- comprehensive tests
- auditable decisions

Avoid temporary shortcuts that create structural debt in the core project model.

---

# 48. Product Intelligence Loop

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

The intelligence loop should improve as Nivasa accumulates product knowledge, material knowledge, design knowledge, project history, market observations, user feedback and execution knowledge.

---

# 49. Long-Term Competitive Moat

The moat is not a single AI model.

It is the combination of:

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

This connected system becomes harder to replicate as the underlying knowledge and project graph grows.

---

# 50. No-Premature-Closure Rule

A phase or step must **never** be closed merely because:

- code compiles
- CI is green
- Prisma migration exists
- a model exists
- an API exists
- a UI exists
- a provider contract exists
- a source registry exists
- a small subset of products exists

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

The repository must always distinguish between **IMPLEMENTED** and **VISION / TARGET**.

---

# 51. Current Implementation Status Contract

Authoritative status must be determined from:

1. merged implementation
2. current branch/PR state
3. passing CI
4. tests
5. integration coverage
6. security checks
7. open issues
8. acceptance audits

The README preserves the complete vision so implementation does not gradually lose product scope. It must be updated when the implementation genuinely changes, but unfinished capabilities must never be represented as completed.

---

# 52. Definition of Done

A capability is production-complete only when the relevant contract is demonstrated end-to-end.

```text
REQUIREMENT
    ↓
DESIGN
    ↓
IMPLEMENTATION
    ↓
VALIDATION
    ↓
TESTS
    ↓
AUTHORIZATION / SECURITY
    ↓
INTEGRATION
    ↓
CI
    ↓
DOCUMENTATION
    ↓
ACCEPTANCE AUDIT
```

A green CI run is necessary, but it is not by itself the definition of done.

---

# 53. Startup-Grade Product Standard

Nivasa should be built for real homeowners and real commercial transactions.

The system must optimize for:

- trust
- clarity
- affordability
- quality
- speed
- flexibility
- reliability
- explainability
- scalability

The customer should never need to understand Nivasa's internal complexity to benefit from it.

Complexity belongs behind the product experience.

---

# 54. Complete Nivasa Promise

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

---

# 55. Final Nivasa Product Principle

Nivasa must not be built as a collection of disconnected features.

Every major product and engineering decision should ask:

> **Does this make the complete Nivasa journey more connected, more intelligent, more transparent, more affordable, more useful and more executable for the homeowner?**

The end goal is not simply to generate beautiful interiors.

The goal is to fundamentally reshape how people:

**understand → design → compare → choose → budget → visualize → buy → build their homes.**

---

# Nivasa

**Your home. Designed your way.**

**Understand it. Design it. Compare it. Optimize it. Visualize it. Buy it. Build it.**
