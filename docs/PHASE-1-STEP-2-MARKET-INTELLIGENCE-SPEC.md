# Phase 1 Step 2 — Market Intelligence Production Specification

## Purpose
Nivasa's Budget Reality engine must be backed by a source-provenant interior market intelligence layer. The system is source-agnostic and must scale beyond 500 sources without schema redesign.

## Canonical pipeline
Source Registry → Acquisition Adapter → Raw Evidence → Normalization → Canonical Product → Source Product/Variant → Historical Observation → Confidence/Freshness → Comparable/Alternative Graph → Budget Reference.

## Source coverage
The registry must cover manufacturers, brands, retailers, marketplaces, interior/design companies, local/regional vendors, dealers, fabricators and specialist suppliers across furniture; wardrobes/storage; kitchens; bathroom/sanitary/plumbing; tiles/surfaces; paint/wall finishes; plywood/MDF/HDF/boards/laminates/veneers; hardware; false ceiling/gypsum/acoustic; lighting; electrical; fans/smart home; flooring; rugs/curtains/blinds; doors/glass/partitions; mattresses/soft furnishings/decor; appliances; outdoor/balcony/kids/office; and execution/service providers.

500+ distinct sources is the first coverage milestone, not a ceiling. Every source record must have canonical identity, domain, source type, categories, geography, acquisition method, access/terms/licensing status, eligibility, freshness policy, provenance policy and active status.

## Product depth
Where legitimately available, preserve product/SKU/source ID, exact variant/configuration, title, description, brand/manufacturer/vendor/seller, taxonomy, dimensions/units, material/construction, finish/colour, options/customization, media references, list/current/sale price, currency/unit, tax/shipping/installation inclusion, region, availability/stock/delivery/install status, warranty, returns, source URL, evidence, retrieval timestamp, confidence and freshness.

Do not stop at room-level products. Component-level data is first-class where exposed: hinges, channels, handles, lifts, baskets, drawer systems, locks, faucets, diverters, concealed systems, shower components, sink accessories, LED profiles/drivers, switches/sockets, ceiling systems, boards, laminates, veneers, edge bands and other small interior inputs.

## Price truth
Observed source prices are immutable historical observations. Never overwrite history. Preserve observation time, source, variant, seller, geography and evidence. Distinguish source-observed facts from Nivasa-verified facts, estimates and recommendations. Never fabricate missing prices or specifications.

## Acquisition
Prefer official APIs, feeds, partner data and licensed/authorized catalogues. Where permitted, use public catalogue/page extraction or approved imports. Respect robots/access controls, terms, licensing, privacy and applicable law. A source may remain registered for manual/partner/user-provided ingestion when automated acquisition is not permitted.

## Quality
Adapters use a common ingestion contract and are idempotent. Normalization must be deterministic. Marketplace seller identity is retained. Duplicate products must be linked rather than silently merged when specifications differ. Freshness and confidence are queryable. Evidence must survive downstream normalization.

## Product relationships
Support exact product, compatible component, comparable alternative, cheaper alternative, premium alternative, substitute, accessory, bundle and supersedes/superseded relationships. Relationships must carry provenance/confidence where applicable.

## Budget integration
Budget versions reference catalog observations by immutable identifiers/snapshots; mutable catalog updates must never rewrite locked budget history. Budget calculations continue to use integer INR minor units/bigint.

## Completion gate
Step 2 market intelligence is not complete until schema, registry, representative adapters, normalization, evidence/provenance, historical observations, component modelling, idempotency and tests are implemented, and the full repository CI gate passes: npm ci, format:check, lint, prisma generate, typecheck, test, prisma validate, build, git diff --check.
