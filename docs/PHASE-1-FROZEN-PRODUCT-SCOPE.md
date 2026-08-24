# NIVASA — PHASE 1 FROZEN PRODUCT SCOPE

Status: FROZEN

This document is the implementation guardrail for Phase 1. No Phase 1 feature may be added, removed, or reordered without an explicit architecture decision.

## Core product journey

1. Home
   - property profile
   - floor-plan capture/import
   - room detection
   - user correction
   - Home DNA
2. User understanding
   - household
   - lifestyle
   - design personality
   - storage needs
   - functional needs
   - future needs
3. Money
   - budget conversation
   - Nivasa Budget Reality
   - recommended budget
   - user adjustment
   - locked budget
4. Design
   - multiple design directions
   - explain why
   - room-by-room exploration
   - keep/change/remove
   - revisions
5. Real-world Product Intelligence
   - actual product image/evidence
   - brand
   - exact product/SKU where available
   - MRP/observed price and price type
   - material
   - features/specifications
   - durability/corrosion resistance only when evidenced
   - warranty only when evidenced
   - source and freshness
   - recommendation rationale
   - strengths/weaknesses versus alternatives
   - no invented facts
6. Cost Intelligence
   - live design cost
   - What-If simulator
   - cheaper/better alternatives
   - Nivasa Savings Mode
7. Smart Home
   - switches
   - lighting scenes
   - sensors
   - music/automation
   - room-entry experiences
   - visual demonstrations
   - product/device mapping
8. Build
   - buildability checks
   - BOQ
   - catalogue
   - Shop Your Home
   - DIY/self-procurement
9. Experience
   - ₹99 design document
   - ₹2,599 rich visualization/design experience
   - downloadable room/overall images
   - ₹9,999 immersive video/walkthrough + execution-plan experience
10. Execution
   - site reality check
   - design lock
   - BOQ lock
   - GST quotation
   - manpower/labour/logistics/material/other costs
   - Nivasa margin
   - negotiation
   - contract
   - immersive final walkthrough
   - execution
   - project tracking
   - handover
   - Nivasa Home

## Cross-cutting requirements

- language selection
- multilingual UI
- contextual AI help
- Nivasa notifications
- transparent product provenance
- server-side entitlements
- auditability
- authorization at every protected boundary
- deterministic money handling
- evidence-backed product facts
- freshness and confidence tracking

## Dependency order

Home Intelligence → Home DNA → Budget → Design → Product Intelligence → What-If/Savings → Smart Home → Buildability/BOQ → Localization/Assistant/Notifications → Commercial/Visualization → Walkthrough → Execution

Dependencies must be respected. Later domains must not silently invent or bypass upstream domain state.

## Non-negotiable product integrity rules

1. No invented product facts.
2. No AI-generated warranty claims.
3. No estimate presented as a verified price.
4. Every displayed commercial value has a price type, source/evidence state, geography where relevant, observation/freshness timestamp, and confidence where applicable.
5. Exact product/SKU claims require evidence identifying that product.
6. Product images must be tied to the evidenced product/variant; generated imagery must never be presented as a real product photograph.
7. Recommendations must expose their rationale and material trade-offs.
8. Alternatives must be comparable on the attributes that materially affect the decision.
9. Source references are backend provenance/evidence; the user experience presents understandable product details first and exposes evidence on demand.
10. Scraping/acquisition must remain compliant with source access rules, terms, robots directives, licensing and applicable law. A discovered website is not automatically an ingestion source.

## Source and market-intelligence standard

Nivasa's fragmented-market advantage depends on broad, governed evidence rather than a list of websites. Sources may include manufacturers, authorized dealers, marketplaces, interior platforms, design studios, local vendors, artisans, material suppliers and service providers.

The source universe must cover every meaningful interior component from major systems to small decorative and functional items, including furniture, wardrobes, kitchens, hardware, plywood, laminates, surfaces, tiles, sanitaryware, plumbing, electrical, lighting, fans, smart home, appliances, furnishings, curtains/blinds, rugs, artwork, paintings, mandir/pooja components, décor, accessories, local fabrication and installation services.

Each source must be classified and governed before production ingestion. The production intelligence model must preserve provenance from source evidence through normalized product/SKU, price observation, specification, unit, geography, timestamp, confidence and recommendation.

## Mandatory implementation contract

Every Phase 1 domain follows:

model → service → API → authorization → tests → CI → integration → merge

A domain is not considered implemented because its schema or documentation exists. It must be executable, tested, authorized, integrated and verified by CI.

## Phase 1 completion rule

Phase 1 is complete only when the frozen product journey is represented in the production architecture and every committed Phase 1 domain has passed its domain gates without bypassing the dependency order or product-integrity rules above.
