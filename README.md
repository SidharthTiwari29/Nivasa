# NIWASTHAN

**Your home. Designed your way.**

> **Ghar mein ghusne se pehle, ghar ko experience karo.**

## The Home Intelligence Platform

Niwasthan is an AI-native home-interior platform for India that takes a homeowner from their **real property and floor plan** to an exceptionally well-designed, transparent, budget-aware, purchasable, buildable and experienceable home.

Niwasthan is **not** merely an AI image generator, catalogue, BOQ calculator, marketplace, designer directory, project-management tool or 360° viewer. Its differentiation is the connected intelligence system that links the customer's actual home to design, real materials and products, choices, savings, buildability, visualization, procurement, execution and persistent home intelligence.

> **Status rule:** This README is the canonical end-to-end product and engineering contract. It describes the agreed target vision and implementation foundations. It must never be used to claim that an unfinished capability is already production-complete.

---

# 1. NORTH STAR

Niwasthan should take a homeowner through:

```text
REAL PROPERTY
      ↓
FLOOR PLAN / PHOTOS / USER BRIEF
      ↓
SPATIAL UNDERSTANDING
      ↓
ROOM + ELEMENT MODEL
      ↓
EXCEPTIONAL DESIGN INTELLIGENCE
      ↓
MULTIPLE STRONG DESIGN DIRECTIONS
      ↓
REAL MATERIALS + COMPONENTS + PRODUCTS
      ↓
MORE OPTIONS
      ↓
BETTER OPTIONS
      ↓
BETTER DEALS
      ↓
WHAT-IF / SAVINGS
      ↓
SMART HOME
      ↓
BUILDABILITY / BOQ / BUDGET
      ↓
LOCALIZATION / ASSISTANT / NOTIFICATIONS
      ↓
COMMERCIAL / VISUALIZATION
      ↓
NIWASTHAN IMMERSIVE
      ↓
WALK THROUGH MY FUTURE HOME
      ↓
PROCUREMENT
      ↓
EXECUTION
      ↓
QUALITY / SNAGGING / HANDOVER
      ↓
HOME MEMORY / NIWASTHAN DNA™
```

Product promise:

> **Understand my home → design my home → show me my home → explain what it costs → help me choose better → help me save → help me buy → help me build it → let me experience it → remember my home.**

### Customer promise

**More Options. Better Options. Better Deals. Better Decisions. Better Homes.**

---

# 2. WHAT NIWASTHAN IS SOLVING

Interior design is fragmented across:

- designers and architects
- contractors and execution teams
- brands and manufacturers
- retailers, dealers and marketplaces
- product/material research
- quotations and spreadsheets
- BOQs and budgets
- visualization tools
- procurement
- delivery and installation
- quality and snagging

The homeowner often becomes the researcher, coordinator, negotiator and quality controller.

Niwasthan aims to make this coherent:

```text
DESIGN
+
PRODUCT / MATERIAL DISCOVERY
+
PRICE TRANSPARENCY
+
VALUE / SAVINGS
+
WHAT-IF INTELLIGENCE
+
BUILDABILITY
+
BOQ / BUDGET
+
VISUALIZATION
+
IMMERSIVE EXPERIENCE
+
PROCUREMENT
+
EXECUTION
```

Niwasthan optimizes for **design quality + practicality + transparency + affordability + value + execution confidence**, not merely the lowest price.

---

# 3. NON-NEGOTIABLE PRINCIPLES

## 3.1 Design First

Beautiful renders alone are insufficient. Designs must respect, where information is available:

- actual dimensions
- proportions and scale
- circulation and ergonomics
- storage
- natural light and ventilation
- electrical/plumbing requirements
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
- photographs
- videos
- measurements
- property details
- existing furniture
- lifestyle requirements
- preferences
- budget
- constraints

## 3.3 Transparency First

For important decisions the homeowner should understand:

- what is recommended
- why it is recommended
- price and price basis
- source
- freshness / last verification
- product or material specifications
- brand
- warranty where available
- alternatives
- trade-offs
- potential savings
- confidence / evidence
- downstream impact

Niwasthan must never invent facts to make a recommendation look complete.

## 3.4 Value First

```text
CHEAPEST ≠ BEST VALUE ≠ BEST QUALITY ≠ BEST DEAL
```

A genuine deal requires evidence. Niwasthan should explain trade-offs rather than blindly recommend the cheapest option.

## 3.5 User Control

Users can progressively:

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

A locked decision must not be silently changed by later AI generation.

## 3.6 No Fabricated Certainty

Unknown or AI-inferred information must remain explicitly:

```text
UNKNOWN
```

or:

```text
ESTIMATED / INFERRED
```

with appropriate confidence until confirmed.

Niwasthan must never fabricate:

- dimensions
- prices
- availability
- warranties
- product identity
- evidence
- supplier success
- execution completion
- savings claims

## 3.7 Buildability Matters

> **Beautiful must also be buildable.**

AI-generated visual quality is never sufficient acceptance evidence for a real-world design decision.

---

# 4. CANONICAL DEVELOPMENT SEQUENCE

The agreed product dependency chain is:

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
PROCUREMENT / EXECUTION
```

This is a dependency map, not merely a marketing sequence.

Supporting foundations such as authentication, authorization, database integrity, migrations, jobs, observability, security and CI are developed as required dependencies.

A feature must not bypass its intelligence and data foundations merely because it is visually exciting or commercially attractive.

---

# 5. THE NIWASTHAN DEVELOPMENT RULE

> **No feature gets built just because it sounds exciting.**

Every proposed capability must answer:

1. Does it strengthen the homeowner journey?
2. Does it use or strengthen Niwasthan's intelligence graph?
3. Does it create measurable value through better design, transparency, affordability, quality, confidence or execution?
4. Does it have a clear dependency position?
5. Can it be implemented production-grade rather than as a demo?
6. Can it be tested, secured, observed and supported?
7. Does it preserve user control and commercial integrity?

If not, it does not enter the production build queue.

---

# 6. PROPERTY + SPATIAL INTELLIGENCE

Niwasthan must create a persistent spatial representation of the customer's actual home.

Where supported by evidence it should represent:

- property and floor
- rooms and boundaries
- walls
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

Target workflow:

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

# 7. LAYOUT UPLOAD → EXCEPTIONAL INTERIOR DESIGNER

A defining Niwasthan capability is that when a customer uploads their apartment layout, Niwasthan should be capable of reasoning like an exceptionally strong interior designer grounded in that **actual home**.

It should reason about:

- space planning
- furniture placement
- circulation
- proportions
- storage
- lighting
- colour and texture
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

Niwasthan should challenge a poor decision rather than blindly follow it:

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

# 8. MULTIPLE DESIGNS + USER-CONTROLLED REVISIONS

Niwasthan should generate multiple strong design directions rather than one generic AI image.

Directions may include:

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

Different rooms may use different economic strategies:

```text
PREMIUM KITCHEN
+
VALUE LIVING
+
CUSTOM BEDROOM
+
BUDGET UTILITY
```

The system should maintain overall coherence while respecting room-level choices.

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

Important changes must preserve:

- what changed
- why
- who
- when
- previous value
- new value
- affected materials/products
- BOQ impact
- budget impact
- visualization impact
- procurement impact

---

# 9. INTERIOR INTELLIGENCE GRAPH

Niwasthan models the interior universe rather than treating products as isolated rows.

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

This graph is the bridge between design, real products, materials, prices, buildability and execution.

---

# 10. INTERIOR SCOPE

The long-term universe is extensible and covers, as applicable:

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

# 11. SOURCE → OBSERVATION → EVIDENCE → CANONICAL ENTITY

Niwasthan must never treat imported, scraped or supplied information as automatically authoritative.

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

# 12. CANONICAL PRODUCT + VARIANT IDENTITY

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

Meaningful variants remain distinct when size, finish, colour, material, capacity, specification, model or SKU changes meaningfully.

Niwasthan must not merge unrelated products merely because names are similar.

---

# 13. SOURCE UNIVERSE + 500+ SOURCE AMBITION

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

A **500+ legitimate source target** is an implementation-scale ambition, not a quality guarantee. Source quality matters more than count.

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

# 14. MORE OPTIONS

Niwasthan should provide substantially more useful choices across:

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
- services

The system must group and rank choices rather than overwhelm the homeowner with duplicate listings.

---

# 15. BETTER OPTIONS

Niwasthan should identify better options using evidence-backed signals such as:

- quality
- compatibility
- durability
- design fit
- maintenance
- warranty
- availability
- service
- confidence
- budget fit
- project compatibility

Potential labels include:

- Premium
- Best Overall
- Smart Buy
- Best Value
- Budget Pick
- Deal

Labels must be explainable and must not imply unsupported guarantees.

---

# 16. BETTER DEALS

Niwasthan must distinguish:

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

# 17. SUBSTITUTION INTELLIGENCE

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

Niwasthan should explain what changes, what remains unchanged, expected quality differences, maintenance differences, durability differences and visual impact.

---

# 18. PROJECT-LEVEL OPTIMIZATION

Niwasthan should eventually optimize the entire interior project, not merely one product.

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

# 19. MATERIALS, COMPONENTS + ASSEMBLIES

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

# 20. DESIGN-TO-PRODUCT GROUNDING

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

If a visual object is only an AI-generated concept and cannot currently be sourced, it must be clearly identified as illustrative.

It must never silently appear to be a real catalogue product.

---

# 21. BOQ

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

BOQ should support:

- room-wise items
- material/component/product line items
- quantities and units
- persisted catalogue rates
- labour
- services
- taxes/charges where applicable
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

# 22. BUDGET INTELLIGENCE

Niwasthan should continuously answer:

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

# 23. REVISION IMPACT ENGINE

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

Niwasthan should identify affected downstream objects and explain the impact.

Example:

> Changing this countertop will affect 2 BOQ items, change the estimated budget and require regeneration of the kitchen visualization.

---

# 24. WHAT-IF + SAVINGS INTELLIGENCE

What-If is a core intelligence layer, not a decorative calculator.

Users should be able to ask:

- What if I change this material?
- What if I choose another product?
- What if I upgrade this?
- What if I downgrade this?
- What if I keep my existing furniture?
- What if I use a local/custom alternative?
- What if I reduce the budget by ₹1 lakh?
- What can I change without materially affecting the design?
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

# 25. NIWASTHAN REALITY CHECK

Beautiful AI concepts are not enough.

**Niwasthan Reality Check** asks:

> **Looks beautiful. Now let's check whether it actually works.**

Where evidence and spatial data permit, it should evaluate:

- dimensions
- circulation
- clearances
- door/window conflicts
- electrical requirements
- plumbing requirements
- mounting
- installation
- material compatibility
- maintenance implications
- delivery constraints
- assembly requirements
- buildability

The output should distinguish verified constraints from estimates.

---

# 26. BEFORE-YOU-BUY INTELLIGENCE

Before a customer commits to a product or design choice, Niwasthan should identify relevant risks and requirements.

Examples:

- dimensions
- clearance
- electrical load
- plumbing
- mounting
- installation
- warranty
- maintenance
- delivery
- assembly
- compatibility

Principle:

> **Before you buy, Niwasthan checks what you might otherwise discover too late.**

---

# 27. SMART HOME INTELLIGENCE

Smart-home intelligence should be part of the broader home system, not a disconnected gadget catalogue.

Niwasthan should consider:

- lighting
- switches
- sensors
- security
- locks
- climate
- automation
- energy-related choices
- compatibility
- installation
- future expansion

Recommendations should account for the actual property and project context.

---

# 28. LOCALIZATION + NIWASTHAN ASSISTANT

Niwasthan should feel native to the customer.

The platform should be localization-ready for major Indian languages and regional contexts while supporting English as a first-class language.

The architecture should support, as applicable:

- English
- Hindi
- Kannada
- Tamil
- Telugu
- Malayalam
- Marathi
- Bengali
- Gujarati
- Punjabi

The experience should support natural code-switching rather than mechanical translation.

Example:

> “Aapka kitchen layout thoda tight hai — agar hob yahan shift karein, toh approximately ₹8,000 save ho sakte hain.”

The **Niwasthan Assistant** should understand the customer's project context and explain decisions in human language.

It should not become a generic chatbot disconnected from the home model.

---

# 29. NIWASTHAN PERSONALITY

Niwasthan should be intelligent, warm, slightly quirky, useful and brandable.

It should never become childish, spammy or distracting.

The personality layer must be context-aware and user-controllable.

Examples:

> 🛋️ **Your sofa has officially found its spot.**

> 💸 **Good news: we found a cheaper option that doesn't look cheaper.**

> 🕵️ **We found something suspicious… your dream wardrobe is ₹18,400 cheaper from another source.**

> 🚨 **Your budget just looked at that marble and said: “Absolutely not.”**

> 📋 **The BOQ is ready. The numbers have nowhere left to hide.**

> 🚪 **Your future home is ready. Shall we go inside?**

Humour is optional and must never obscure financial, safety, legal or execution information.

---

# 30. NIWASTHAN MOMENTS — QUIRKY, USEFUL NOTIFICATIONS

Notifications should be **useful first and delightful second**.

The system can turn meaningful project events into contextual **Niwasthan Moments**:

```text
EVENT
  ↓
INTELLIGENCE
  ↓
CONTEXT
  ↓
PERSONALITY
  ↓
NIWASTHAN MOMENT
```

Examples:

**Price drop**

> 🔥 “Remember that light you liked? It just got cheaper. We noticed.”

**Better alternative**

> 🕵️ “We found a lookalike. Same vibe. Less damage to the wallet.”

**Budget issue**

> 😅 “We have crossed the budget line. Should we retreat gracefully?”

**Design approved**

> 🎉 “Locked. No more changing the sofa every 14 minutes.”

**Walkthrough ready**

> 🚪 “Your future home is ready. Shall we go inside?”

Notifications must respect user preferences, quiet hours and frequency limits. Important transactional, financial and safety notifications remain clear and unambiguous.

---

# 31. WHAT WOULD YOU DO? MODE

Customers should be able to ask:

> **“What would you do if this were your home?”**

Niwasthan should answer using the actual project context:

- apartment dimensions
- lifestyle
- budget
- style
- family needs
- maintenance
- durability
- availability
- long-term value

The answer should explain reasoning and trade-offs.

This is decision intelligence, not generic AI conversation.

---

# 32. DESIGN BATTLE

Customers should be able to compare competing design directions using meaningful metrics.

Example:

|                          | Design A | Design B |
| ------------------------ | -------: | -------: |
| Cost                     |    ₹6.8L |    ₹7.2L |
| Storage                  |      82% |      94% |
| Durability               |   8.1/10 |   9.0/10 |
| Maintenance              |      Low |   Medium |
| Style match              |      88% |      94% |
| Niwasthan recommendation |       ⭐ |   ⭐⭐⭐ |

Exact metrics and scoring must become evidence-based as the system matures.

---

# 33. NIWASTHAN FINDS

**Niwasthan Finds** is the proactive discovery layer.

Example:

> **Niwasthan Found a Better Deal**
>
> Selected pendant: ₹8,900  
> Similar verified option: ₹5,999  
> Potential saving: ₹2,901  
> Style match: 92%  
> Availability: Bengaluru  
> Warranty: 2 years

The system should distinguish:

- exact match
- close alternative
- functional substitute
- visual lookalike
- premium upgrade
- budget alternative

No fabricated price, availability or product evidence is acceptable.

---

# 34. NIWASTHAN MAGIC

**Niwasthan Magic** is reserved for occasional, genuinely useful discoveries.

Example:

> ✨ **Niwasthan Magic**
>
> We noticed your living room gets strong evening sunlight.
>
> We found an alternative curtain/material combination that could improve heat control while reducing the estimated cost by ₹12,600.

Magic must always be explainable and evidence-backed.

It must never become a justification for random AI-generated surprises.

---

# 35. VISUALIZATION

Visualization is a core experience, not decoration.

Target capabilities include:

- photorealistic images
- consistent camera views
- before/after
- panorama
- 360° assets
- 3D scenes
- actual-apartment visualization
- immersive walkthrough
- video recording/export

The signature requirement is:

> **A customer uploads their actual apartment layout and sees that exact apartment transformed according to the selected design.**

The output should feel like **“This is my apartment”**, not a generic room inspired by the prompt.

---

# 36. NIWASTHAN IMMERSIVE — ENTER YOUR FUTURE HOME™

This is one of Niwasthan's signature experiences.

## Critical definition

**Niwasthan Immersive is NOT merely a 360° panorama or rotating video.**

The target experience is a **first-person, spatially consistent representation of the customer's own apartment** where the customer can enter and navigate through the designed home at human scale.

The customer should feel:

> **“I am entering my future home.”**

Target progression:

```text
CUSTOMER'S ACTUAL APARTMENT
        ↓
VERIFIED SPATIAL MODEL
        ↓
APPROVED DESIGN
        ↓
REAL MATERIALS + PRODUCTS
        ↓
SPATIALLY CONSISTENT 3D HOME
        ↓
FIRST-PERSON ENTRY
        ↓
WALK THROUGH THE APARTMENT
        ↓
ROOM-TO-ROOM NAVIGATION
        ↓
LOOK LEFT / RIGHT / UP / DOWN
        ↓
EXPLORE EVERY NOOK & CORNER
        ↓
UNDERSTAND SCALE + PROPORTION
        ↓
EXPERIENCE MATERIALS + LIGHTING + ATMOSPHERE
        ↓
MAKE DESIGN DECISIONS
```

Target capabilities progressively include:

- first-person navigation
- room-to-room movement
- spatial consistency
- persistent walls, doors and windows
- human-scale proportions
- furniture consistency
- material/finish representation
- lighting representation
- interactive product/design context
- immersive exploration
- optional video recording/export
- future VR/AR pathways

A rotating panorama can be an intermediate or supporting asset, but **it does not satisfy the full Niwasthan Immersive acceptance target by itself**.

### Spatial consistency is mandatory

If the customer walks from the living room into the kitchen, it must be the **same kitchen connected to the same apartment**, not a disconnected AI-generated scene.

---

# 37. HOME BOOK

**Niwasthan Home Book** is the structured, durable record of the customer's home project.

It should progressively bring together:

- approved designs
- room decisions
- products/materials
- specifications
- BOQ
- budgets
- alternatives
- savings
- warranties
- execution information
- project documents
- purchase information
- home history

It should remain useful beyond a one-time design transaction.

---

# 38. NIWASTHAN DNA™

Niwasthan DNA™ is the persistent intelligence identity of the customer's home/project.

Subject to user controls, privacy and security, it progressively captures:

- home identity
- spatial information
- style preferences
- lifestyle requirements
- product preferences
- material preferences
- decisions
- approvals and locks
- budget behaviour
- project history
- selected/purchased items
- execution information
- maintenance-relevant information

Long-term model:

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
MY NIWASTHAN DNA™
```

DNA should make future recommendations more relevant without removing user control.

---

# 39. COMMERCIAL PRODUCT LADDER

Niwasthan's commercial packaging is a real entitlement system, not merely a pricing page.

The finalized customer journey is:

```text
₹199        → DISCOVER
₹999        → DESIGN
₹2,599      → PLAN
₹9,999      → EXPERIENCE
```

The commercial ladder is intentionally structured around **customer outcomes**, not feature-count inflation.

| Plan                       |      Price | Customer promise                    | Core purpose                                                                          |
| -------------------------- | ---------: | ----------------------------------- | ------------------------------------------------------------------------------------- |
| **Niwasthan Starter**      |   **₹199** | **Discover your home.**             | Understand the home and experience the first Niwasthan value moment                   |
| **Niwasthan Design** ⭐    |   **₹999** | **Design your home.**               | Turn the understood home into meaningful, controlled design intelligence              |
| **Niwasthan Home Book**    | **₹2,599** | **Plan your home with confidence.** | Connect design decisions to products, cost, savings, buildability and project records |
| **Niwasthan Immersive** 👑 | **₹9,999** | **Enter your future home.**         | Experience the approved home as a spatially consistent first-person environment       |

## 39.1 NIWASTHAN STARTER — ₹199

**Discover your home.**

This is an affordable impulse-buy entry product, not a renamed free tier. It must create a genuine first **“Niwasthan understands my home”** moment while preserving a clear reason to progress into Design.

Target capabilities:

- create a Home Project
- upload floor plan, photos and requirements
- AI-powered Home Understanding
- basic room and space analysis
- discover Home Design Personality
- 3 personalised design directions
- initial room recommendations
- guided AI design conversation
- initial material and style suggestions
- personalised **Home Snapshot**
- preview of deeper design possibilities
- clear upgrade pathway into Niwasthan Design

**Customer question answered:**

> _“Does Niwasthan really understand my home?”_

---

## 39.2 NIWASTHAN DESIGN — ₹999 ⭐ MOST POPULAR

**Design your home.**

This is the commercial centre of the ladder and should be the default recommendation for most homeowners who are ready to design.

Everything in Starter, plus:

### Design Intelligence

- complete design analysis
- room-by-room design intelligence
- multiple strong design directions
- Luxury
- Premium
- Smart Luxury
- Modern
- Contemporary
- Minimal
- Warm
- Value
- Budget
- personalised combinations

### Design Studio

- compare design directions
- accept/reject important decisions
- revise individual elements
- replace materials
- upgrade/downgrade selections
- lock important decisions
- preserve approved decisions
- design version history

### Better Choices

- product and material recommendations
- better-value alternatives
- premium alternatives
- budget alternatives
- material comparisons
- initial price/value intelligence

### Intelligence

- selected What-If scenarios
- initial savings opportunities
- **Design Battle**
- **Niwasthan Finds**
- stronger project-aware Assistant

**Customer question answered:**

> _“What could my home become, and which design should I actually choose?”_

**Value positioning:**

> **₹999 • The sweet spot for most homeowners**

---

## 39.3 NIWASTHAN HOME BOOK — ₹2,599

**Plan your home with confidence.**

This is where Niwasthan moves from **design inspiration → serious project intelligence**.

Everything in Design, plus:

### Your Home Book

- complete digital Home Book
- approved designs
- design decisions
- product selections
- material selections
- specifications
- project history
- persistent home record

### Know What It Costs

- detailed BOQ
- room-wise costing
- material quantities
- component quantities
- product quantities
- labour considerations
- service considerations
- budget allocation
- cost-driver analysis
- project-level cost view

### Save Intelligently

- What-If cost impact
- upgrade vs downgrade analysis
- alternative products
- material substitutions
- better-value options
- savings opportunities
- project-level optimisation
- Better Deals intelligence

### Reality Check

> **Looks beautiful. Now let's check whether it actually works.**

- dimension checks
- circulation checks
- clearance considerations
- door/window conflicts
- electrical considerations
- plumbing considerations
- mounting considerations
- material compatibility
- maintenance considerations
- buildability considerations

### Before You Buy

- product dimensions
- compatibility
- installation considerations
- warranty considerations
- maintenance considerations
- delivery considerations

**Customer question answered:**

> _“What should I choose, what will it cost, where can I save and can it actually be built?”_

---

## 39.4 NIWASTHAN IMMERSIVE — ₹9,999 👑

**Enter your future home.**

This is a premium experience, not simply the most expensive feature bundle.

Everything in Home Book, plus:

### Your Home → 3D

- approved design converted into a spatial 3D home
- based on the customer's actual apartment
- verified spatial dimensions where available
- consistent walls, doors and windows
- human-scale proportions

### Enter Your Future Home

- first-person navigation
- room-to-room movement
- living → kitchen → bedrooms → balcony
- explore every corner
- natural look-around movement
- understand scale and proportions
- persistent spatial layout

### Experience the Design

- furniture placement
- materials and finishes
- lighting representation
- design atmosphere
- product/design context
- spatial relationships

### Take It With You

- cinematic walkthrough
- 360° walkthrough assets
- walkthrough recording/export where supported
- future VR/AR pathway

**Customer question answered:**

> _“I don't want to imagine my future home. I want to step inside it.”_

---

## 39.5 COMMERCIAL POSITIONING RULES

The four tiers must not be presented as arbitrary feature buckets.

They represent four increasingly valuable homeowner outcomes:

```text
₹199
DISCOVER
“Does Niwasthan understand my home?”
        ↓
₹999
DESIGN
“What could my home become?”
        ↓
₹2,599
PLAN
“What should I choose, what will it cost and how can I build it better?”
        ↓
₹9,999
EXPERIENCE
“What will it actually feel like to live there?”
```

Commercial UX should:

- make **₹999 Design** the visual hero / most-popular choice
- make ₹199 feel like a real product, not a disguised free trial
- make ₹2,599 feel like a serious project-planning upgrade
- make ₹9,999 feel like a premium immersive experience
- communicate outcomes before exhaustive feature lists
- expose detailed entitlements through an expandable comparison rather than overwhelming pricing cards
- make upgrade paths clear without manipulative dark patterns

The short customer journey is:

> **Understand → Design → Decide → Experience**

And the underlying promise remains:

> **More Options. Better Options. Better Deals. Better Decisions. Better Homes.**

Exact usage limits and entitlement boundaries remain product configuration, but paid capabilities must be enforceable server-side. Pricing may evolve through deliberate product decisions; unrelated domain logic must not hard-code commercial assumptions.

---

# 40. PROCUREMENT

Niwasthan must eventually connect approved design decisions to purchasing:

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
      ↓
INSTALLATION
```

Procurement intelligence should support, as applicable:

- verified suppliers
- product/source provenance
- price comparison
- local sourcing
- availability
- delivery
- installation
- substitutions
- bundles
- order/project linkage
- commercial reconciliation

The customer should understand what they are paying for and what is included.

---

# 41. EXECUTION

The final goal is not a beautiful screen.

It is a better home delivered in the real world.

Niwasthan should progressively connect:

```text
DESIGN
 ↓
APPROVAL
 ↓
BOQ
 ↓
PROCUREMENT
 ↓
DELIVERY
 ↓
INSTALLATION
 ↓
QUALITY CHECKS
 ↓
SNAGGING
 ↓
HANDOVER
 ↓
HOME MEMORY
```

Execution capabilities must be developed only when dependencies and operational requirements are ready.

---

# 42. QUALITY, SNAGGING + HANDOVER

The home journey does not end at purchase.

The long-term system should support:

- delivery verification
- installation status
- quality checks
- snag identification
- issue ownership
- resolution status
- evidence/photos
- approvals
- final handover
- warranty/project record

The project history should remain connected to the Home Book and Niwasthan DNA where appropriate.

---

# 43. TRANSPARENCY + EVIDENCE MODEL

Every important recommendation should increasingly be explainable.

Where possible, the customer should see:

- source
- evidence
- confidence
- freshness
- assumptions
- alternatives
- price impact
- trade-offs
- buildability implications
- savings methodology

Niwasthan should never manufacture certainty where evidence is unavailable.

---

# 44. TRUST, SECURITY + USER CONTROL

Niwasthan handles valuable home, financial, design and project information.

The platform therefore requires:

- strong authorization
- appropriate authentication
- tenant isolation
- privacy-aware data handling
- auditability
- safe AI behaviour
- provider abstraction
- secure payment handling
- controlled notifications
- user-controlled personalization
- no fabricated catalogue/procurement claims

The intelligence layer remains subordinate to user choice.

---

# 45. ENGINEERING ARCHITECTURE PRINCIPLES

The product vision requires production-grade engineering.

Core principles include:

- domain-oriented architecture
- clear service boundaries
- typed contracts
- schema validation
- database integrity
- migration discipline
- authorization at boundaries
- idempotent financial/webhook operations
- durable asynchronous jobs
- AI provider abstraction
- observability
- rate limiting
- testability
- deterministic business logic where required
- CI enforcement

AI-generated content must not bypass domain validation.

---

# 46. DATA + INTELLIGENCE INTEGRITY

The intelligence layer should preserve a clear distinction between:

```text
FACT
ESTIMATE
INFERENCE
RECOMMENDATION
USER DECISION
```

Downstream systems such as BOQ, savings, procurement and immersive visualization must consume the appropriate state rather than treating every AI output as fact.

The system should maintain provenance and confidence where required.

---

# 47. ASSISTANT + NOTIFICATION GOVERNANCE

The assistant and notification systems must remain connected to project truth.

They should understand, where authorized:

- current project state
- approved decisions
- locked decisions
- budget state
- relevant product observations
- BOQ changes
- execution state
- user preferences

They must not:

- silently change decisions
- invent status
- invent prices
- spam users
- override quiet hours without legitimate priority
- expose data across users/projects

Personality is a presentation layer over trustworthy product state, not a replacement for it.

---

# 48. COMMERCIAL INTEGRITY

Paid capabilities must be enforced by the server-side entitlement system.

The commercial layer should support:

- plans
- entitlements
- feature gates
- usage limits
- purchases
- payment state
- refunds/cancellations where applicable
- idempotent webhooks
- audit records
- controlled upgrades/downgrades

The UI must never be the sole authority for paid access.

The canonical plan catalogue is:

| Plan code / tier | Customer-facing plan    |      Price |
| ---------------- | ----------------------- | ---------: |
| Starter          | **Niwasthan Starter**   |   **₹199** |
| Design           | **Niwasthan Design**    |   **₹999** |
| Home Book        | **Niwasthan Home Book** | **₹2,599** |
| Immersive        | **Niwasthan Immersive** | **₹9,999** |

Exact internal identifiers may differ by implementation, but commercial configuration must map to this canonical customer-facing ladder unless deliberately changed through a reviewed product decision.

---

# 49. PRODUCTION ACCEPTANCE STANDARD

A feature is not “done” because:

- a database model exists
- an API route exists
- a UI exists
- an AI prompt works once
- a mock looks impressive
- a branch exists
- a demo succeeds manually

Production acceptance requires the appropriate combination of:

- implementation
- domain correctness
- validation
- authorization
- security
- tests
- integration
- CI
- observability
- error handling
- migration safety
- operational readiness
- acceptance evidence

The same standard applies to AI, catalogue, pricing, BOQ, immersive and commercial functionality.

---

# 50. DEVELOPMENT PHASING

The repository should evolve through explicit phases and acceptance gates.

The product vision must not be confused with current implementation status.

```text
VISION
  ↓
DEPENDENCIES
  ↓
IMPLEMENTATION
  ↓
TESTS
  ↓
CI
  ↓
SECURITY / OPERATIONAL REVIEW
  ↓
ACCEPTANCE EVIDENCE
  ↓
ONLY THEN → COMPLETE
```

Phase work must remain sequenced. A later capability being present in code does not automatically mean the earlier phase is complete or accepted.

README status claims must remain evidence-based.

---

# 51. THE NIWASTHAN DIFFERENCE

Niwasthan aims to combine capabilities that are normally fragmented:

```text
INTERIOR DESIGN
       +
HOME / SPATIAL INTELLIGENCE
       +
PRODUCT / MATERIAL INTELLIGENCE
       +
PRICE / DEAL INTELLIGENCE
       +
WHAT-IF / SAVINGS
       +
BUILDABILITY
       +
BOQ / BUDGET
       +
LOCALIZATION
       +
ASSISTANT
       +
NIWASTHAN MOMENTS
       +
COMMERCIAL
       +
IMMERSIVE VISUALIZATION
       +
PROCUREMENT
       +
EXECUTION
       +
PERSISTENT NIWASTHAN DNA™
```

The homeowner should not have to become an interior designer, quantity surveyor, procurement specialist and contractor just to make a good home.

> **Niwasthan should make the complexity understandable.**

---

# 52. CANONICAL PRODUCT PRINCIPLES

1. **Home first.** Start with the customer's actual space.
2. **Intelligence before spectacle.** Visual wow must be grounded in correct underlying data.
3. **Exceptional design.** Uploaded layouts should lead to genuinely strong, explainable design intelligence.
4. **More options, better options, better deals.** Choice must create value.
5. **Transparency over persuasion.** Show reasoning, evidence and trade-offs.
6. **Affordable entry, meaningful upgrade paths.** Every commercial tier must deliver genuine value; ₹199, ₹999, ₹2,599 and ₹9,999 represent progressively deeper outcomes rather than arbitrary feature bundles.
7. **Beautiful must also be buildable.** Reality Check is part of the product philosophy.
8. **Personality without noise.** Niwasthan can be witty, but never at the expense of clarity.
9. **Immersive means entering the home.** A panorama alone is not the destination.
10. **Persistent intelligence.** The home should become smarter over time through Niwasthan DNA™.
11. **Execution matters.** The ultimate measure is the home delivered, not the screen displayed.
12. **User remains in control.** Recommendations assist; they do not silently decide.
13. **No fabricated certainty.** Unknown information remains unknown until verified.
14. **Evidence before claims.** Especially for price, availability, savings and procurement.
15. **No feature for novelty alone.** Every feature must justify its place in the journey.
16. **Delight must be useful.** Quirky notifications and Magic moments should create value, not distraction.
17. **One canonical vision.** New requirements amend this document deliberately rather than creating competing product definitions.

---

# 53. PRODUCT NORTH STAR — THE CUSTOMER'S EXPERIENCE

The long-term Niwasthan experience is:

> **Upload your home.**
>
> **Let Niwasthan understand it.**
>
> **Get exceptional design directions.**
>
> **Compare and control every important decision.**
>
> **Explore more options.**
>
> **Find better options.**
>
> **Find better deals.**
>
> **Ask What-If.**
>
> **See exactly what changes and what it saves.**
>
> **Check whether the beautiful idea can actually be built.**
>
> **See the complete cost and BOQ.**
>
> **See your actual apartment transformed.**
>
> **Enter your future home.**
>
> **Walk through every room and nook.**
>
> **Buy with confidence.**
>
> **Build with transparency.**
>
> **Keep your home's intelligence with you through Niwasthan DNA™.**

---

# 54. STATUS OF THIS DOCUMENT

This README is the **canonical Niwasthan product vision and engineering north star**.

It is **not** a claim that every capability described above is already implemented.

Current implementation status must be established separately through repository audits, tests, CI and acceptance evidence.

The commercial ladder is currently finalized as:

```text
NIWASTHAN STARTER       ₹199
NIWASTHAN DESIGN        ₹999
NIWASTHAN HOME BOOK   ₹2,599
NIWASTHAN IMMERSIVE   ₹9,999
```

If a new requirement is discovered, the vision should be amended deliberately, reviewed for dependency impact and then locked again. We should not maintain competing versions of the Niwasthan vision.

> **Niwasthan is not building another interior-design app. It is building an intelligent system for understanding, designing, experiencing, buying and building a home.**
