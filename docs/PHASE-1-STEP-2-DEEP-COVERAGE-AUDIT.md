# Phase 1 Step 2 — Exhaustive Coverage Audit

## Objective

Niwasthan must build a production-grade Indian home-interior intelligence layer, not a small furniture catalogue. Every material, product, service, design reference and price-bearing component that can materially affect a residential interior should have a source and data strategy.

## Research-derived source families

### Design and inspiration

- Livspace
- NoBroker Interiors
- DesignCafe
- HomeLane
- Bonito Designs
- Decorpot
- Asian Paints Beautiful Homes
- local interior designers, architects and studios
- design publications and award archives

### Marketplaces and broad retail

- Amazon India
- Flipkart
- IKEA India
- Pepperfry
- Urban Ladder
- WoodenStreet
- Wakefit
- Home Centre
- @home
- FabIndia Home
- West Elm
- Pottery Barn
- The Sleep Company
- Nilkamal

### Furniture and storage

- Godrej Interio
- Aristo
- Durian
- Featherlite
- Stanley
- Sleepwell
- Kurlon
- Duroflex
- Nilkamal
- Spacewood
- Sleek
- local modular manufacturers and carpenters

### Kitchen, wardrobe and hardware

- Hettich
- Häfele
- Blum
- Ebco
- Godrej
- Aristo
- Ozone
- Dorset
- Yale
- DormaKaba
- Grass
- Kesseböhmer
- FGV
- local hardware distributors

### Boards, laminates, veneers and surfaces

- Greenply
- Greenpanel
- CenturyPly
- Kitply
- Merino
- Royale Touche
- Virgo
- Stylam
- Rushil Decor
- Archidply
- Durian laminates
- Saint-Gobain
- Gyproc
- Knauf
- local plywood and laminate dealers

### Paints and wall finishes

- Asian Paints
- Berger
- Nerolac
- Dulux
- Indigo Paints
- JSW Paints
- Birla Opus
- Nippon Paint
- wallpapers and specialist wall-finish vendors

### Tiles, stone and flooring

- Kajaria
- Somany
- Orientbell
- Johnson
- Simpolo
- Nitco
- RAK Ceramics
- Qutone
- VitrA
- marble/granite/quartz fabricators
- SPC/vinyl/wood flooring brands

### Bathroom, sanitaryware and plumbing

- Hindware
- Jaquar
- CERA
- Kohler
- Roca
- Parryware
- GROHE
- Duravit
- VitrA
- Neycer
- TOTO
- BathStory
- Essco
- Watertec
- Hindware Italian
- local sanitary and plumbing dealers

### Lighting and electrical

- Philips/Signify
- Wipro Lighting
- Havells
- Anchor by Panasonic
- Legrand
- Schneider Electric
- GM Modular
- Goldmedal
- Polycab
- Finolex
- Syska
- Bajaj Electricals
- Orient Electric
- Crompton
- decorative lighting studios

### Fans, smart home and security

- Atomberg
- Havells
- Orient
- Crompton
- Usha
- Panasonic
- Qubo
- Godrej Security
- Yale
- Schneider Wiser
- Legrand connected home
- local automation integrators

### Curtains, blinds, rugs and soft furnishings

- D'Decor
- Bombay Dyeing
- Spaces
- Portico
- Raymond Home
- Swayam
- HomeTown
- The Loom
- Jaypore Home
- IKEA
- Hunter Douglas
- Vista Fashions
- local curtain/blind/fabric dealers

### Art, décor and collectible objects

- Pepperfry
- Amazon
- Flipkart
- IKEA
- Jaypore
- Chumbak
- Elvy
- The Decor Remedy
- Artisanal and gallery sources
- local artists and studios
- painting marketplaces
- sculpture and artefact vendors

### Mandir / pooja / devotional design

- Livspace pooja designs
- NoBroker pooja units
- specialist wooden mandir vendors
- marble mandir vendors
- brass mandir vendors
- CNC/jaali manufacturers
- pooja-room furniture vendors
- devotional painting vendors
- Pichwai artists
- Tanjore painting artists
- Madhubani artists
- Kalamkari artists
- temple mural specialists
- brass bell/diya/thali vendors
- idol/murti vendors
- local craftsmen

### Appliances

- Samsung
- LG
- Bosch
- IFB
- Whirlpool
- Haier
- Panasonic
- Voltas
- Blue Star
- Daikin
- Faber
- Elica
- Kaff
- Glen
- Livpure
- Aquaguard

### Doors, glass, windows and architectural fittings

- Saint-Gobain Glass
- AIS
- Fenesta
- Aparna Venster
- GEZE
- DormaKaba
- Ozone
- glass processors
- aluminium/uPVC fabricators
- mosquito-screen vendors

### Outdoor, balcony and garden

- IKEA
- Pepperfry
- Urban Ladder
- Home Centre
- Nilkamal
- outdoor furniture manufacturers
- artificial grass vendors
- planters/nursery vendors
- balcony shading/blind vendors

### Designers, craftsmen and services

- national design platforms
- regional interior studios
- architects
- modular installers
- carpenters
- electricians
- plumbers
- painters
- false-ceiling contractors
- tile/stone fabricators
- glass/aluminium fabricators
- curtain installers
- smart-home integrators

## Product granularity requirements

Niwasthan must support more than a category and price. Canonical product intelligence should capture, where applicable:

- source and seller
- manufacturer/brand
- product/SKU/model
- variant
- room
- category/subcategory/product type
- style
- material
- grade/quality
- finish/colour
- dimensions
- capacity/load
- configuration
- quantity/pack size
- unit of measure
- MRP/list price
- selling price
- discount
- tax inclusion
- shipping
- installation
- fabrication/customisation
- minimum order quantity
- availability
- lead time
- geography/city/pincode
- warranty
- return policy
- evidence URL/content hash
- observed timestamp
- freshness expiry
- confidence

## Pricing model requirements

The intelligence layer must distinguish:

1. retail SKU price
2. marketplace selling price
3. manufacturer MRP
4. dealer/distributor quote
5. per-square-foot rate
6. per-running-foot rate
7. per-piece rate
8. per-set rate
9. per-sheet rate
10. per-kg/litre rate
11. labour-only rate
12. material-plus-labour rate
13. installation rate
14. fabrication/customisation rate
15. project/package quote

Rates must never be silently compared across incompatible units.

## Design-reference model

Design inspiration and purchasable products are different evidence classes. Niwasthan should store both:

- design image/reference
- room/context
- style tags
- visible design elements
- inferred product candidates
- source attribution
- confidence that a candidate matches the reference
- estimated/observed cost range

A reference image must not be represented as proof of a specific SKU or price.

## India-specific requirements

- city and pincode sensitivity
- GST/tax semantics
- local dealer pricing
- regional availability
- regional labour rates
- Indian measurement units
- INR minor-unit storage
- multilingual/search aliases
- Indian product terminology
- local craftsmanship and custom fabrication
- culturally specific spaces such as pooja/mandir

## Acquisition governance

No website should automatically become scrape-eligible merely because it is discovered. Every source requires:

- access status
- acquisition method
- robots/terms review
- licensing status
- allowed evidence scope
- freshness policy
- provenance policy
- active/disabled status

Preferred acquisition order:

1. official API/feed/affiliate/catalogue
2. licensed data/feed
3. permitted public catalogue retrieval
4. merchant-provided data
5. manual/curated import
6. user-provided quote/evidence

## Production gates still required

- 500+ source records verified against real source domains
- complete category coverage audit
- source governance review
- adapter interface and representative adapters
- raw evidence persistence
- canonical product persistence
- source-SKU persistence
- price observation persistence
- unit/pack normalization
- geography and delivery semantics
- historical price snapshots
- product matching/deduplication
- alternative/substitute graph
- design-reference extraction
- provenance exposed to users
- stale-data handling
- ingestion replay/idempotency
- failure/dead-letter monitoring
- database schema/client parity
- integration tests with PostgreSQL
- security/access controls
- performance/index review

## Definition of done

Step 2 is not complete when a list of websites exists. It is complete when Niwasthan can take a real interior requirement such as “3BHK contemporary pooja room with a wall-mounted mandir, painting, lighting, storage and budget of ₹X”, identify appropriate design references and purchasable components, compare compatible products/rates from governed sources, show the evidence and timestamp, explain the unit/price assumptions, and generate a reproducible budget calculation.
