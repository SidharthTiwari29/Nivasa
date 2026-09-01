# Phase 1 Step 2 — Reference Intelligence Gap Audit

## Purpose

Niwasthan must use external interior sources as governed evidence, not as a user-facing website list. The reference layer must support design discovery, product specifications, pricing benchmarks, alternatives, and provenance.

## Reference families

1. End-to-end interior designers and design marketplaces: NoBroker Interiors, Livspace, DesignCafe, HomeLane, Bonito Designs, Decorpot and comparable regional studios.
2. General marketplaces and retailers: Amazon, Flipkart, IKEA, Pepperfry, Urban Ladder, Home Centre, WoodenStreet, Wakefit and comparable retailers.
3. Furniture and storage manufacturers: Godrej Interio, Aristo and comparable manufacturers.
4. Hardware: Hettich, Häfele, Blum, Ebco, Dorma, GEZE and comparable suppliers.
5. Boards and surfaces: plywood, MDF, HDHMR, laminates, veneers, acrylic, solid surface, quartz, granite, marble, tiles, SPC, vinyl and wood suppliers.
6. Ceiling and partition systems: Saint-Gobain Gyproc, Knauf and comparable systems suppliers.
7. Bath and plumbing: Hindware, BathStory, Jaquar, CERA, Kohler, Roca, Parryware, GROHE, Duravit, VitrA, TOTO and comparable suppliers.
8. Paint and wall finishes: major paint manufacturers, wallpaper suppliers, texture/microcement suppliers and specialist finish studios.
9. Electrical and smart home: switches, sockets, wires, protection, automation, locks, sensors, cameras and control suppliers.
10. Lighting and fans: decorative, architectural, functional, smart and outdoor lighting plus ceiling/pedestal/decorative fans.
11. Furnishings: curtains, blinds, upholstery, rugs, carpets, cushions, throws, bedding, mattresses, towels and table linen.
12. Appliances: kitchen, laundry, cooling, water heating, purification and small appliances.
13. Doors, windows and glass: systems, profiles, glazing, mirrors, shower enclosures, railings and fittings.
14. Decor and art: paintings, prints, canvas, framed art, sculptures, murals, mirrors, clocks, vases, artefacts, planters and decorative objects.
15. Indian cultural/pooja: wall and floor mandirs, traditional and contemporary pooja units, jaali/backdrops, brass accessories, diyas, bells, idols, devotional art, Pichwai, Tanjore, Madhubani, Kalamkari, murals and regional craft.
16. Local ecosystem: city-level dealers, fabricators, carpenters, installers, stone suppliers, glass vendors, electricians, plumbers, painters, curtain/blind installers and specialist craftsmen.

## Detail contract

A reference source is useful only when its observations can be mapped to structured fields where available:

- source identity and canonical domain
- source type and acquisition method
- geography and service area
- category/subcategory/product type
- brand, model and SKU/external ID
- product name and normalized identity
- dimensions and dimensional unit
- material, grade, thickness and finish
- colour, style and variant
- quantity/pack size and commercial unit
- MRP/list price, selling price and quoted price
- rate basis such as piece, set, sqft, running ft, sheet or project
- tax/shipping/installation inclusion state
- availability and lead time
- warranty and relevant certifications/specifications
- source URL and evidence snapshot/hash
- observed timestamp and freshness
- confidence and verification state
- comparable, substitute and accessory relationships

## Price interpretation rules

Never collapse fundamentally different price types into one number. Preserve list/MRP, observed retail selling price, dealer/quote price, indicative rate, fabrication, labour, installation, delivery and tax as separate observations. City-specific rates must retain their geography and observation date. Package prices must not be presented as equivalent to SKU prices.

## User presentation

External websites are backend provenance. The user sees a normalized option with specifications, price range, assumptions, alternatives and confidence. A "Why this price?" or "View evidence" interaction can expose the supporting source observations, dates and methodology without turning the product experience into a directory of links.

## Coverage gate

Step 2 source coverage is not complete merely because a source name exists in a registry. Each source must progress through discovery, governance review, acquisition eligibility, adapter/import method, observation validation and production ingestion before it contributes to live intelligence. The 500+ target is a minimum breadth target, not proof of production coverage.

## Current research observations

NoBroker currently exposes room, style and component-level design discovery, room-wise estimation and detailed quotation concepts; its catalogue taxonomy includes kitchens, wardrobes, TV units, tables, bathrooms, tiles, false ceilings, wall panels, wallpapers, flooring, balconies and many other design categories. Livspace similarly combines end-to-end interiors, modular solutions, furniture/decor/furnishings/lighting/bath fittings and civil/technical services. These sources are therefore useful for design taxonomy and workflow benchmarking, while manufacturer/retailer sources should supply product-level evidence and price observations. Studio Matrx demonstrates a useful structured material-rate pattern with specification, unit, quality, IS code and Bengaluru-adjusted ranges.

## Mandatory next implementation layers

1. Prisma model parity with market-intelligence persistence tables.
2. Raw evidence and immutable observation persistence.
3. Adapter contract with robots/terms/access governance and replay-safe ingestion.
4. Product/SKU normalization and deterministic identity keys.
5. Unit and pack normalization.
6. Price-component normalization with explicit tax/shipping/installation semantics.
7. Geography and freshness model.
8. Cross-source matching, substitutes and accessories.
9. Design-reference model linking rooms, styles and components to products.
10. Evidence/confidence API and user-facing transparency contract.
11. Representative real-source adapters/import fixtures across every major family.
12. Expand and verify the 500+ source universe without claiming inaccessible sources are live.
