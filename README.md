# Nivasa

**Your home. Designed your way.**

> **Ghar mein ghusne se pehle, ghar ko experience karo.**

Nivasa is an AI-powered home-design, product-discovery, cost-transparency, visualization and execution platform for homeowners in India.

Nivasa is **not** merely an AI image generator, catalogue, BOQ calculator, marketplace, designer directory or project-management tool. Its core advantage is a connected intelligence system that links the customer's actual home to design, real products and materials, choices, savings, buildability, visualization, procurement and execution.

```text
HOME
  ↓
SPACE / LAYOUT INTELLIGENCE
  ↓
DESIGN INTELLIGENCE
  ↓
INTERIOR / PRODUCT / MATERIAL INTELLIGENCE
  ↓
WHAT-IF / SAVINGS INTELLIGENCE
  ↓
SMART HOME INTELLIGENCE
  ↓
BUILDABILITY / BOQ / BUDGET
  ↓
LOCALIZATION / ASSISTANT / NOTIFICATIONS
  ↓
COMMERCIAL + VISUALIZATION
  ↓
IMMERSIVE WALKTHROUGH
  ↓
PROCUREMENT
  ↓
EXECUTION
  ↓
QUALITY / HANDOVER
```

> **README status rule:** This document is the canonical product-and-engineering vision and acceptance contract. It describes both target capabilities and implementation foundations. A capability must not be described as production-complete until implementation, tests, security, integration, CI and acceptance evidence exist.

---

# 1. North Star

Nivasa should take a homeowner from:

```text
MY ACTUAL PROPERTY
      ↓
MY FLOOR PLAN / PHOTOS / REQUIREMENTS
      ↓
NIVASA UNDERSTANDS MY SPACE
      ↓
NIVASA DESIGNS MY HOME
      ↓
I GET MULTIPLE STRONG OPTIONS
      ↓
I CAN ASK WHAT-IF QUESTIONS
      ↓
I SEE REAL PRODUCTS / MATERIALS / PRICES / EVIDENCE
      ↓
I SEE BETTER OPTIONS AND BETTER DEALS
      ↓
I SEE WHAT I CAN SAVE
      ↓
I SEE BUILDABILITY / BOQ / BUDGET IMPACT
      ↓
I SEE MY ACTUAL APARTMENT
      ↓
I EXPERIENCE MY FUTURE HOME
      ↓
I APPROVE
      ↓
I BUY / PROCURE
      ↓
I BUILD
      ↓
I HAND OVER
```

Product promise:

> **Understand my home → design my home → show me my home → explain what it costs → help me choose better → help me save → help me buy → help me build it.**

---

# 2. What Nivasa Is Solving

Interior design is fragmented across:

- designers
- architects
- contractors
- suppliers
- brands
- marketplaces
- furniture stores
- material vendors
- quotations
- spreadsheets
- BOQs
- visualization tools
- procurement
- execution teams

The homeowner often has to become the coordinator, researcher, negotiator and quality controller.

Nivasa aims to make the homeowner's experience coherent:

```text
DESIGN
+
PRODUCT DISCOVERY
+
PRICE TRANSPARENCY
+
VALUE / SAVINGS
+
VISUALIZATION
+
BUILDABILITY
+
PROCUREMENT
+
EXECUTION
```

The system optimizes for **design quality + practicality + transparency + value + execution confidence**, not simply lowest price.

---

# 3. Non-Negotiable Principles

## 3.1 Design First

Beautiful renders are insufficient. Design must respect:

- actual dimensions
- proportions
- scale
- circulation
- ergonomics
- storage
- natural light
- ventilation
- electrical requirements
- plumbing requirements
- known structural constraints
- furniture dimensions
- kitchen workflow
- wardrobe usability
- lighting
- materials
- durability
- maintenance
- constructability
- lifestyle
- budget

## 3.2 Real Home First

The customer's actual property is the source of truth wherever information has been confirmed.

Inputs may include:

- floor plans
- apartment layouts
- room photographs
- dimensions
- property details
- lifestyle requirements
- existing furniture
- preferences
- budget
- constraints

## 3.3 Transparency First

For important decisions, the homeowner should understand:

- what is recommended
- why it is recommended
- price
- price basis
- MRP/reference price where available
- source
- freshness
- product/material specifications
- brand
- warranty information where available
- alternatives
- trade-offs
- potential savings
- confidence

Nivasa must never invent facts to make a recommendation look complete.

## 3.4 Value First

```text
CHEAPEST ≠ BEST VALUE ≠ BEST QUALITY ≠ BEST DEAL
```

The system must distinguish price, value, quality and genuine deal evidence.

## 3.5 User Control

Users can:

- accept
- reject
- compare
- modify
- replace
- upgrade
- downgrade
- lock
- preserve
- revert

important decisions.

A locked decision must not be silently changed by subsequent AI generation.

## 3.6 No Fabricated Certainty

AI inference is not automatically authoritative.

Unknown information remains:

```text
UNKNOWN
```

or:

```text
ESTIMATED / INFERRED
```

with appropriate confidence until confirmed.

Nivasa must never fabricate:

- dimensions
- prices
- availability
- warranties
- product identity
- evidence
- provider success
- execution completion

---

# 4. The Canonical Nivasa Development Sequence

The product roadmap is deliberately ordered because later capabilities depend on earlier intelligence.

```text
INTELLIGENCE
      ↓
WHAT-IF / SAVINGS
      ↓
SMART HOME
      ↓
BUILDABILITY / BOQ
      ↓
LOCALIZATION / ASSISTANT / NOTIFICATIONS
      ↓
COMMERCIAL / VISUALIZATION
      ↓
WALKTHROUGH / IMMERSIVE
      ↓
EXECUTION
```

This sequence is the canonical product dependency chain.

A feature should not bypass the foundation merely because it is visually exciting or commercially attractive.

---

# 5. Nivasa Development Rule

> **No feature gets built just because it sounds exciting.**

Every feature must earn its place by answering:

1. Does it strengthen the homeowner journey?
2. Does it use or strengthen Nivasa's intelligence graph?
3. Does it create measurable value through better design, transparency, affordability, quality, confidence or execution?
4. Does it have a clear dependency position in the roadmap?
5. Can it be implemented production-grade rather than as a demo-only feature?
6. Can it be tested, secured, observed and supported operationally?

If the answer is no, the feature does not enter the production build queue.

---

# 6. Property and Spatial Intelligence

Nivasa must create a persistent spatial representation of the customer's actual home.

Where supported by evidence it should represent:

- property
- floor
- room
- walls
- boundaries
- doors
- windows
- openings
- dimensions
- circulation
- fixed architectural elements
- electrical constraints
- plumbing constraints
- known structural constraints
- usable zones
- furniture zones
- storage zones
- lighting zones
- confidence
- uncertainty

Target flow:

```text
FLOOR PLAN / PHOTOS / MEASUREMENTS
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

Incorrect geometry can corrupt design, product selection, BOQ, visualization and execution. Spatial uncertainty therefore remains explicit.

---

# 7. Layout Upload → Exceptional Interior Designer

A defining Nivasa capability is the ability to take a customer's uploaded apartment layout and reason like an exceptionally strong interior designer grounded in that actual home.

Nivasa should reason about:

- spatial planning
- furniture placement
- circulation
- proportions
- storage
- lighting
- colour
- texture
- kitchen workflow
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
- budget
- buildability

Nivasa should not blindly follow a request that produces a poor outcome.

```text
USER REQUEST
    ↓
DESIGN ANALYSIS
    ↓
ISSUE / TRADE-OFF
    ↓
EXPLANATION
    ↓
BETTER ALTERNATIVES
    ↓
USER DECISION
```

The signature long-term experience is:

> **Upload my actual apartment layout and see my actual apartment transformed according to my selected design.**

---

# 8. Design Intelligence

Nivasa should generate and reason over multiple design directions rather than one generic image.

Supported directions include, as appropriate:

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
PREMIUM KITCHEN
+
VALUE LIVING
+
CUSTOM BEDROOM
+
BUDGET UTILITY
```

The system must maintain overall coherence while respecting room-level choices.

---

# 9. Design Versioning and User Control

Design is a persistent lifecycle:

```text
DESIGN PROJECT
    ↓
VERSION
    ↓
REVISION
    ↓
DESIGN ELEMENT CHANGES
    ↓
DOWNSTREAM IMPACT
```

Important changes must be traceable:

- what changed
- why
- who changed it
- when
- previous value
- new value
- affected products/materials
- BOQ impact
- budget impact
- visualization impact
- procurement impact

Locked decisions are protected constraints.

---

# 10. Interior Intelligence Graph

Nivasa models the interior universe rather than treating catalogue products as isolated rows.

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

This graph is what allows Nivasa to reason from a design choice to real materials, products, costs and execution requirements.

---

# 11. Interior Scope

The intelligence universe is extensible and includes:

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
Faucets, sinks, sanitaryware, shower systems, refrigerators, ovens, microwaves, dishwashers, hobs, chimneys, washing machines, dryers, air conditioners and televisions.

### Soft Furnishing and Decor
Curtains, blinds, rugs, cushions, upholstery, mirrors, artwork, plants and decorative objects.

### Smart Home
Smart lighting, sensors, locks, automation, security and connected devices.

### Execution
Carpentry, electrical, plumbing, painting, fabrication, false ceiling, installation, delivery, assembly and site execution.

---

# 12. Source → Observation → Evidence → Canonical Entity

Nivasa must never treat imported, scraped or supplied information as automatically authoritative.

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

Market observations should preserve, where available:

- source identity
- source reference
- external ID
- observed timestamp
- verification timestamp
- geography
- currency
- price
- MRP/reference price
- availability
- seller
- evidence reference
- confidence
- freshness

A source name alone is not evidence.

---

# 13. Canonical Product and Variant Identity

The same product can appear across multiple sources.

```text
SOURCE A → PRODUCT X → ₹12,999
SOURCE B → PRODUCT X → ₹11,499
SOURCE C → PRODUCT X → ₹13,499
             ↓
       CANONICAL PRODUCT X
             ↓
     OBSERVATIONS / HISTORY
```

Meaningful variants remain distinct where size, finish, colour, material, capacity, specification, model or SKU changes meaningfully.

The system must not merge unrelated products merely because names are similar.

---

# 14. Source Universe and 500+ Source Ambition

The long-term source universe may include:

- manufacturers
- brands
- retailers
- marketplaces
- dealers
- distributors
- local suppliers
- service providers
- execution partners

A **500+ legitimate source target** is an implementation-scale ambition, not a quality guarantee.

Source quality is more important than source count.

A source must have appropriate:

- eligibility
- governance
- provenance
- freshness
- normalization
- identity handling
- evidence handling

A source appearing in a registry does not automatically mean its data is ingestible.

---

# 15. More Options

Nivasa should provide substantially more useful choices across:

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

The intelligence layer must group and rank choices rather than overwhelm the homeowner with duplicates.

---

# 16. Better Options

Nivasa should identify better options using evidence-backed signals such as:

- quality
- compatibility
- durability
- design fit
- maintenance
- evidence confidence
- budget fit
- availability
- service
- warranty
- project compatibility

Potential explainable labels include:

- Premium
- Best Overall
- Smart Buy
- Best Value
- Budget Pick
- Deal

Labels must be explainable and must not imply unsupported guarantees.

---

# 17. Better Deals

Nivasa must distinguish:

```text
CHEAPEST
≠
BEST VALUE
≠
BEST DEAL
```

Deal intelligence may consider:

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

Local/custom alternatives may be surfaced where appropriate, with explicit quality, durability, service and execution trade-offs.

---

# 18. What-If and Savings Intelligence

What-if is a core intelligence layer, not a decorative calculator.

Users should be able to ask:

- What if I change this material?
- What if I choose another product?
- What if I upgrade this?
- What if I downgrade this?
- What if I keep my existing furniture?
- What if I use a local/custom alternative?
- What if I reduce the budget by ₹1 lakh?
- What can I change without affecting the design significantly?
- What should I never compromise?

Flow:

```text
CURRENT DESIGN
      ↓
WHAT-IF CHANGE
      ↓
DESIGN IMPACT
      ↓
MATERIAL / PRODUCT IMPACT
      ↓
BOQ IMPACT
      ↓
PRICE IMPACT
      ↓
SAVINGS / EXTRA COST
      ↓
QUALITY / PERFORMANCE / MAINTENANCE TRADE-OFF
      ↓
USER DECISION
```

---

# 19. Substitution Intelligence

```text
CURRENT CHOICE
      ↓
ALTERNATIVE
      ↓
PRICE DIFFERENCE
      ↓
SAVING
      ↓
QUALITY IMPACT
      ↓
PERFORMANCE IMPACT
      ↓
DESIGN IMPACT
      ↓
MAINTENANCE IMPACT
      ↓
USER DECISION
```

Nivasa must explain what changes and what remains unchanged.

---

# 20. Project-Level Optimization

Nivasa should optimize the entire project rather than only individual products.

```text
ORIGINAL PROJECT
₹12,50,000

OPTIMIZED PROJECT
₹10,90,000

POTENTIAL SAVING
₹1,60,000
```

The savings explanation should identify contributing areas, for example:

```text
₹45,000 → kitchen materials
₹30,000 → wardrobe hardware
₹20,000 → lighting
₹25,000 → furniture
₹30,000 → supplier comparison
```

Protected decisions remain protected.

---

# 21. Smart Home Intelligence

Smart-home recommendations should be grounded in the customer's actual home, lifestyle and design rather than being a generic device catalogue.

Potential domains include:

- lighting automation
- sensors
- smart switches
- security
- smart locks
- comfort
- scenes
- energy awareness
- connected appliances
- room-specific automation

The system should connect:

```text
ROOM
  ↓
LIFESTYLE / USE CASE
  ↓
SMART-HOME SCENARIO
  ↓
DEVICES / SYSTEMS
  ↓
COST
  ↓
DESIGN IMPACT
  ↓
WHAT-IF / VALUE
```

Smart-home features must remain subordinate to the overall home intelligence model.

---

# 22. Materials, Components and Assemblies

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

Material intelligence should support evidence-backed attributes such as:

- grade
- thickness
- construction
- moisture resistance
- load capacity
- durability
- finish
- application suitability
- maintenance
- compatibility

---

# 23. Design-to-Product Grounding

Where procurement is promised, the visual design should connect to real entities whenever possible:

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

If an object is only an AI-generated concept and cannot currently be sourced, it must be clearly identified as illustrative.

---

# 24. Buildability Intelligence

The design must eventually be tested against whether it can actually be built.

Buildability considerations include:

- dimensions
- clearances
- circulation
- material availability
- component compatibility
- hardware requirements
- electrical requirements
- plumbing requirements
- installation requirements
- fabrication constraints
- site constraints
- quantity assumptions
- labour/services

The goal is:

```text
BEAUTIFUL DESIGN
      ↓
BUILDABLE DESIGN
      ↓
QUANTIFIABLE DESIGN
      ↓
COSTABLE DESIGN
      ↓
PROCUREABLE DESIGN
      ↓
EXECUTABLE DESIGN
```

---

# 25. BOQ

BOQ is a living projection of the design and build plan.

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

BOQ should support:

- room-wise items
- material line items
- component line items
- product line items
- quantities
- units
- persisted catalogue rates
- labour
- services
- taxes where applicable
- commercial adjustments
- alternatives
- approved selections
- budget allocation
- versioning
- change impact
- project totals
- exports

Deterministic costing must use persisted catalogue/market data. No fabricated catalogue prices.

---

# 26. Budget Intelligence

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
CURRENT  ₹14,80,000
TARGET   ₹12,50,000
GAP       ₹2,30,000
```

Budget optimization must be explainable.

---

# 27. Revision Impact Engine

Connected changes should propagate:

```text
USER CHANGES MATERIAL
        ↓
DESIGN REVISION
        ↓
PRODUCT / COMPONENT
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

Example:

> Changing this countertop affects 2 BOQ items, changes the estimated budget and requires regeneration of the affected visualization.

---

# 28. Nivasa Product Ladder

Nivasa is designed as a real commercial product, not a pricing-page mockup.

The agreed product ladder is:

| Product | Price | Positioning |
|---|---:|---|
| **Free** | ₹0 | Explore Nivasa and understand the experience |
| **Nivasa Design** | **₹99** | Entry-level design document / design experience |
| **Nivasa Home Book** | **₹2,599** | Rich home intelligence + visualization + product/material detail |
| **Nivasa Immersive** | **₹9,999** | Premium immersive future-home experience + walkthrough + execution pathway |

> **Pricing is configurable commercial data, not hard-coded UI truth.** The package definitions must be server-owned and changeable without rewriting product logic.

The previously discussed ₹999 visualization concept is **not** the canonical current ladder; the cleaner agreed ladder is ₹99 / ₹2,599 / ₹9,999, with Free as the entry tier.

---

# 29. Free Tier

Purpose: allow a homeowner to understand Nivasa and enter the funnel without giving away the entire paid experience.

The exact limits are server-configured, but the tier should be deliberately limited around:

- account creation
- basic property onboarding
- limited exploration
- limited design preview
- limited intelligence exposure
- upgrade prompts tied to real value

Free must not be represented as a full design service.

---

# 30. Nivasa Design — ₹99

Positioning:

> **Affordable entry into a professionally structured Nivasa design experience.**

The ₹99 experience should focus on delivering a meaningful design artifact rather than pretending to be the complete Nivasa journey.

Core capability family:

- property/layout intake
- design brief
- initial design direction
- structured design output/document
- core room/design recommendations
- limited revision capability
- foundational cost awareness where supported

The exact entitlement limits must be server-owned and auditable.

The ₹99 tier should create a natural path into the richer Home Book and Immersive experiences.

---

# 31. Nivasa Home Book — ₹2,599

Positioning:

> **A rich, transparent digital home book that explains the designed home and the real things that make it.**

The Home Book should bring together, where evidence is available:

- room-wise design
- overall-home design
- visual outputs
- downloadable room images
- downloadable overall-home images
- real product images
- product details
- brand
- MRP/reference price
- current/observed price
- material/specification details
- warranty information where available
- source/provenance/freshness
- why-this recommendation
- alternatives
- cost visibility
- BOQ/summary information where included by entitlement
- design decisions
- selected materials/products

Examples of product intelligence should include meaningful attributes, such as material specifications or characteristics like corrosion resistance where supported by evidence.

The customer should be able to understand the relationship between:

```text
MY DESIGN
   ↓
THIS MATERIAL / PRODUCT
   ↓
WHY IT WAS SELECTED
   ↓
WHAT IT COSTS
   ↓
WHAT ALTERNATIVES EXIST
   ↓
WHAT I SAVE / SPEND
```

---

# 32. Nivasa Immersive — ₹9,999

Positioning:

> **Experience your future home before you build it.**

This is the premium signature experience and should extend beyond static renders.

Core experience direction:

```text
ACTUAL HOME
    ↓
FINAL DESIGN
    ↓
REAL MATERIALS / PRODUCTS
    ↓
IMMERSIVE SCENE
    ↓
WALKTHROUGH
    ↓
FUTURE-HOME EXPERIENCE
    ↓
EXECUTION PATHWAY
```

The signature concept is:

> **Enter Your Future Home™**

The customer should feel that they are entering their own future apartment rather than viewing a generic render.

The experience can evolve toward:

- immersive walkthrough
- 3D scene
- 360° experience
- room-to-room navigation
- consistent spatial identity
- design/material context
- product context
- life-in-the-home scenarios
- execution-plan pathway

Immersive is not a substitute for design intelligence. It is the experiential layer built on top of trusted design and spatial data.

---

# 33. Nivasa DNA™

**Nivasa DNA™** is the persistent intelligence identity of a customer's home.

It should progressively understand:

- the actual property
- dimensions and spatial constraints
- rooms
- household needs
- lifestyle
- design preferences
- aesthetic language
- material preferences
- product preferences
- budget behaviour
- protected decisions
- selected products
- alternatives considered
- savings decisions
- smart-home preferences
- project history
- procurement state
- execution state

Conceptually:

```text
MY HOME
  ↓
MY SPACE
  ↓
MY STYLE
  ↓
MY NEEDS
  ↓
MY MATERIALS
  ↓
MY PRODUCTS
  ↓
MY BUDGET
  ↓
MY DECISIONS
  ↓
MY PROJECT HISTORY
  ↓
MY NIVASA DNA™
```

Nivasa DNA should make future recommendations more contextual while preserving user control and privacy.

It should not be treated as a marketing label without an underlying persistent project/intelligence model.

---

# 34. Visualization System

Visualization is a core product capability.

Target layers:

- design boards
- photorealistic renders
- consistent camera views
- before/after
- panorama
- 360°
- 3D scenes
- immersive walkthrough
- video
- actual-apartment visualization

The system must maintain spatial and design consistency across outputs.

AI-generated imagery must not silently create false catalogue claims.

---

# 35. Walkthrough and Future-Home Experience

The walkthrough is the experiential culmination of the intelligence stack.

```text
SPATIAL MODEL
      ↓
DESIGN MODEL
      ↓
REAL PRODUCTS / MATERIALS
      ↓
CONSISTENT 3D SCENE
      ↓
NAVIGATION
      ↓
WALKTHROUGH
      ↓
ENTER YOUR FUTURE HOME™
```

The experience should ultimately allow the customer to understand not just how the home looks, but how it feels to move through it and live in it.

---

# 36. Localization

Nivasa is India-first and should progressively localize intelligence around:

- Indian homes and apartment layouts
- local product availability
- local suppliers
- local service providers
- local pricing
- Indian commercial/tax context where applicable
- regional materials
- regional languages where supported
- local execution realities

Localization must be evidence-backed rather than assumed.

---

# 37. Nivasa Assistant

The assistant is the conversational interface to the connected project graph.

It should answer questions such as:

- Why did you recommend this?
- What is cheaper?
- What is better?
- What will I save?
- What if I change this?
- What does this material mean?
- Is this compatible?
- What is pending?
- What changed since the previous version?
- What needs my approval?
- What is the next step?

The assistant must operate against trusted project/catalogue/evidence data where factual claims matter.

---

# 38. Notifications

Notifications should be useful, not spam.

Examples include:

- design ready
- revision ready
- approval required
- price/availability observation changed
- quote received
- procurement status
- delivery update
- execution milestone
- snag/open issue
- handover readiness

Notifications should be state-driven and auditable.

---

# 39. Commercial Architecture

Nivasa must implement packages as a real commercial system.

Required principles:

- server-owned package definitions
- server-owned feature definitions
- entitlement enforcement
- usage counters/limits where applicable
- feature gating
- payment order creation on the server
- Razorpay integration for India
- signed webhook verification
- idempotent purchase activation
- transactional entitlement state
- concurrency protection
- replay protection
- explicit payment states

The frontend must never independently activate a paid entitlement.

Commercial configuration should support changing package limits/pricing without changing business logic.

---

# 40. Feature Entitlement Model

Commercial packages should be represented through explicit entitlements rather than scattered price checks.

Conceptually:

```text
PACKAGE
  ↓
ENTITLEMENTS
  ↓
FEATURE LIMITS
  ↓
USAGE
  ↓
AUTHORIZATION
  ↓
USER EXPERIENCE
```

Possible entitlement dimensions include:

- number of properties
- design concepts
- revisions
- renders
- visual downloads
- BOQ generations
- advanced product intelligence
- what-if analyses
- immersive access
- walkthrough access
- exports
- assistant capability

Limits must be configuration/data, not duplicated throughout frontend code.

---

# 41. Procurement

Nivasa should eventually connect approved design decisions to purchasing.

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

The project should preserve the relationship between:

- selected item
- selected supplier
- price
- quantity
- approved BOQ
- order
- delivery

---

# 42. Execution

The product journey does not end at procurement.

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

Execution services are first-class project entities.

Examples:

- carpentry
- electrical
- plumbing
- painting
- fabrication
- false ceiling
- installation
- assembly
- site work

Execution records should preserve what was approved, ordered, delivered, installed and changed.

---

# 43. Collaboration and Auditability

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

The system should avoid the question:

> Which file is actually final?

---

# 44. AI Architecture

AI providers must remain behind provider-neutral contracts.

AI capabilities include:

- floor-plan analysis
- spatial understanding
- design generation
- design revision
- product/material grounding
- recommendation
- what-if analysis
- BOQ assistance
- explanation
- visualization prompting
- walkthrough generation
- video prompting
- assistant interactions

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

# 45. Durable AI Jobs

Asynchronous AI jobs should support:

- durable state
- idempotency
- retries
- exponential backoff
- explicit failure states
- provider error handling
- worker lifecycle
- observability
- safe cancellation where appropriate
- no fabricated success

If a provider fails:

```text
PROVIDER FAILURE
      ↓
EXPLICIT FAILURE STATE
      ↓
RETRY / RECOVERY
```

Never:

```text
PROVIDER FAILURE
      ↓
FAKE SUCCESS
```

---

# 46. Persistent Project Model

The core relationship is:

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

This connected model is a primary architectural principle.

---

# 47. Nivasa DNA as the Long-Term Intelligence Loop

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

As the project progresses, Nivasa DNA should accumulate trusted project context without turning assumptions into facts.

---

# 48. Product Roadmap and Engineering Dependency

## Stage 1 — Intelligence

Build the foundation for:

- property
- spatial understanding
- rooms
- design model
- catalogue/material intelligence
- evidence
- canonical identity
- recommendation foundations

## Stage 2 — What-If / Savings

Build:

- substitutions
- alternatives
- price comparison
- savings analysis
- project-level optimization
- budget impact
- protected decisions

## Stage 3 — Smart Home

Build contextual smart-home intelligence grounded in the property, design and lifestyle.

## Stage 4 — Buildability / BOQ

Build:

- buildability checks
- quantities
- BOQ
- deterministic costing
- budget
- revision impact

## Stage 5 — Localization / Assistant / Notifications

Build:

- India/local context
- assistant
- state-driven notifications
- project communication

## Stage 6 — Commercial / Visualization

Build:

- product packages
- entitlements
- payment
- rich visual outputs
- Home Book
- product intelligence presentation

## Stage 7 — Walkthrough / Immersive

Build:

- consistent 3D scene
- 360°
- navigation
- walkthrough
- Enter Your Future Home™

## Stage 8 — Execution

Build:

- procurement
- delivery
- installation
- milestones
- quality
- snagging
- handover

These stages are a product dependency sequence, not permission to claim every stage is already implemented.

---

# 49. Phase 0 — Production Foundation

Phase 0 establishes the engineering foundation:

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

# 50. Phase 0.1 — Production Foundation Acceptance

Phase 0.1 establishes the production-grade server foundation required by the product contract.

It includes, as applicable:

- Auth.js boundaries
- persisted roles
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

Phase 0.1 is not complete merely because these files exist. Acceptance requires implementation, tests, integration, authorization, data integrity, CI, documentation and an end-to-end gap audit.

---

# 51. Phase 1 — Product Capability Build

There is **one Phase 1**. Do not split it into Phase 1A/1B/1C variants.

Phase 1 follows the fixed product dependency sequence:

```text
INTELLIGENCE
→ WHAT-IF / SAVINGS
→ SMART HOME
→ BUILDABILITY / BOQ
→ LOCALIZATION / ASSISTANT / NOTIFICATIONS
→ COMMERCIAL / VISUALIZATION
→ WALKTHROUGH / IMMERSIVE
→ EXECUTION
```

---

# 52. Step 2 — Interior Intelligence Acceptance Contract

Step 2 is more than a catalogue table.

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
SUBSTITUTIONS
   ↓
PROJECT COMPATIBILITY
   ↓
BOQ / BUDGET IMPACT
   ↓
EXPLAINABLE RECOMMENDATION
```

Step 2 is not complete when:

- a source registry exists
- a catalogue table exists
- a few products exist
- an API returns mock data
- a schema compiles
- happy-path tests pass

Acceptance requires:

### Source

- source identity
- source eligibility
- governed adapter

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

- more options
- better options
- better deals
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

The customer must be able to understand:

> **Why is this recommendation being made?**

---

# 53. Testing Contract

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

Local verification should include:

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

# 54. Intelligence and Domain Testing

Market-intelligence tests should cover:

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

Design-intelligence tests should cover:

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

# 55. Security and Commercial Testing

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

# 56. Security Architecture

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

Roles include, as required by the product:

```text
USER
DESIGNER
ADMIN
SUPER_ADMIN
```

Authorization must happen server-side.

---

# 57. Operations

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

When required configuration is absent:

```text
MISSING CONFIGURATION
      ↓
EXPLICIT CONFIGURATION ERROR
```

Never fake provider success.

Redis is required when asynchronous jobs are submitted or a worker is started.

Production credentials must never be committed.

---

# 58. Repository Documentation Contract

The README defines the product contract.

Supporting documents should provide implementation detail without contradicting it, including where present:

- `ARCHITECTURE.md`
- `DEVELOPMENT.md`
- `docs/OPERATIONS.md`

When a supporting document conflicts with the product contract, the conflict must be resolved rather than silently allowing multiple visions.

---

# 59. No-Premature-Closure Rule

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

The repository must clearly distinguish:

```text
IMPLEMENTED
```

from:

```text
VISION / TARGET
```

No unfinished capability may be represented as complete.

---

# 60. Long-Term Competitive Moat

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
WHAT-IF / SAVINGS
        +
BOQ / BUILDABILITY
        +
NIVASA DNA™
        +
VISUALIZATION
        +
IMMERSIVE EXPERIENCE
        +
PROCUREMENT
        +
EXECUTION
```

As project knowledge accumulates, Nivasa should become increasingly capable of making context-aware recommendations while maintaining transparency and user control.

---

# 61. Complete Nivasa Experience

The complete product should feel like one continuous journey:

```text
I UPLOAD MY HOME
        ↓
NIVASA UNDERSTANDS MY SPACE
        ↓
NIVASA UNDERSTANDS MY LIFESTYLE AND REQUIREMENTS
        ↓
NIVASA DESIGNS MY HOME
        ↓
I GET MULTIPLE GREAT OPTIONS
        ↓
I LOCK WHAT MATTERS
        ↓
NIVASA CONNECTS DESIGN TO REAL PRODUCTS / MATERIALS
        ↓
I SEE MORE OPTIONS
        ↓
I SEE BETTER OPTIONS
        ↓
I SEE BETTER DEALS
        ↓
I ASK WHAT-IF QUESTIONS
        ↓
NIVASA SHOWS SAVINGS AND TRADE-OFFS
        ↓
NIVASA RECOMMENDS SMART-HOME OPTIONS
        ↓
NIVASA CHECKS BUILDABILITY
        ↓
NIVASA BUILDS MY BOQ
        ↓
NIVASA EXPLAINS MY BUDGET
        ↓
NIVASA GIVES ME LOCAL / CONTEXTUAL HELP
        ↓
NIVASA SHOWS MY REAL HOME
        ↓
I DOWNLOAD MY HOME BOOK
        ↓
I ENTER MY FUTURE HOME
        ↓
I EXPERIENCE THE WALKTHROUGH
        ↓
I APPROVE
        ↓
NIVASA HELPS ME PROCURE
        ↓
NIVASA SUPPORTS EXECUTION
        ↓
MY HOME GETS BUILT
        ↓
MY PROJECT BECOMES PART OF MY NIVASA DNA™
```

---

# 62. Final Product Principle

Nivasa should not be built as a collection of disconnected features.

Every major product and engineering decision should ask:

> **Does this make the complete Nivasa journey more connected, more intelligent, more transparent, more affordable, more useful, more immersive and more executable for the homeowner?**

The goal is not merely to generate beautiful interiors.

The goal is to fundamentally reshape how people:

**understand → design → compare → choose → optimize → budget → experience → buy → build their homes.**

**Nivasa — Your home. Designed your way.**
