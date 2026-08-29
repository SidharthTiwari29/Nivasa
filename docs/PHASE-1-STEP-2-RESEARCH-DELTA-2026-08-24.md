# Phase 1 Step 2 — Research Delta — 2026-08-24

## Newly validated source patterns

The latest research confirms that Step 2 must support multiple evidence classes rather than treating every source as a retail product source.

- Manufacturer catalogues can expose exact product models, dimensions, categories and MRP/price-list evidence.
- Specialist retailers can expose product/variant pricing and catalogue metadata.
- Interior sourcing platforms can expose broad category taxonomies, dealer relationships and sourcing workflows.
- Local suppliers can expose city-specific catalogues, price lists and customized solutions.
- Material-rate libraries can expose specification, unit, quality, standard/IS code and city-adjusted indicative rates.
- Service providers can expose starting prices and explicit scope/quote caveats.

## Data-model implications

Source records therefore need an evidence-class field and acquisition policy. Product observations must not be conflated with indicative material rates or service starting prices.

Required evidence classes:

1. Manufacturer catalogue / price list
2. Authorized dealer / retailer
3. Marketplace / specialist commerce
4. Local supplier / fabricator
5. Material-rate reference
6. Interior designer / design platform
7. Service / labour / installation provider
8. Art / craft / specialist maker
9. Design inspiration / non-commercial reference

## Price semantics

The ingestion layer must preserve the original price semantics instead of normalizing every value into a single price field:

- MRP/list price
- sale/retail price
- dealer quote
- starting price
- indicative market rate
- rate per sq ft / running ft / piece / set / sheet / metre / litre / kg
- labour/fabrication
- installation
- delivery/logistics
- GST inclusion/exclusion
- validity period
- geography

## Product identity

Equivalent products can have different merchant identifiers. Nivasa therefore requires a canonical product identity separate from source SKU identity, with variant-level attributes and evidence. This is consistent with current research on multi-merchant product identity and semantic product hierarchies.

## Small-item coverage

The same evidence model must represent low-ticket components such as hinges, handles, drawer channels, switches, sockets, sensors, curtain accessories, mirrors, bells, diyas and décor as well as high-ticket products.

## Research examples

Current sources demonstrate the required granularity:

- Neycer exposes dozens of sanitaryware models with category, product name, image and MRP.
- Jindal Plast publishes 2026 price lists spanning sanitaryware, fittings, accessories, plumbing and related products.
- Aquant exposes sanitaryware, faucets, diverters, bath components, accessories and 2026 pricing resources.
- ThinkHome combines an interior catalogue with authorized-dealer sourcing and categories spanning furniture, sanitaryware, lighting, automation, walls/flooring, rugs, décor, kitchens, fabrics, hardware and workstations.
- Decomart publishes manufacturer price lists for Blum, Häfele, Kesseböhmer and furniture/architectural hardware and operates a Bengaluru-focused interior supply catalogue.
- IVAS exposes designer hardware, sanitaryware, bath fittings, quartz, tiles, fans, LED lighting, water heaters and storage/wardrobe categories.
- City-adjusted material references demonstrate that rates can depend on material specification, quality and geography.

## Implementation rule

These findings extend the existing frozen Nivasa architecture; they do not create a new product direction. Research becomes useful only when transformed into governed evidence, normalized product/price observations, provenance and user-facing transparency.
