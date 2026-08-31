# Niwasthan Phase 1 — Step 2 Deep Production Audit

## Scope

This audit treats market intelligence as a production procurement and transparency system, not as a website list. It covers source discovery, governance, acquisition, evidence, product identity, variants, pricing, units, taxes, logistics, installation, geography, freshness, confidence, relationships, ingestion reliability and consumer transparency.

## External research findings

1. Official manufacturer/retailer pages can expose materially different price semantics. IKEA India exposes product price, dimensions, variants, reviews and promotional validity windows; Niwasthan therefore must retain observed price, list price, variant identity and observation/freshness timestamps rather than one mutable price.
2. Hindware publishes catalogue/MRP material through its official catalogue flow; Niwasthan therefore needs catalogue-document evidence in addition to product-page evidence.
3. BathStory exposes both product pricing and service/site-visit pricing, with units such as per-square-foot and service bookings. Niwasthan must model product, service, unit and installation scope separately.
4. Interior material rate references commonly vary by city and quality grade. Niwasthan must never present an indicative city-adjusted rate as an exact seller quote.
5. Indian e-commerce consumer-protection requirements make price transparency and fair presentation material product requirements. Source evidence, timestamps and price semantics are therefore first-class data rather than UI decoration.

## Required production layers

- Source universe: 500+ candidate sources across all 19 canonical interior categories.
- Source governance: access status, terms reference, licensing status, acquisition method, freshness policy and activation decision.
- Acquisition: official site, partner feed/API, licensed data, manual catalogue import and other explicitly approved mechanisms; no silent bypass of access controls.
- Evidence: immutable retrieval metadata, locator, content hash, retrieval method and product linkage.
- Product identity: canonical product, source product, SKU, variant and vendor/seller identity kept separately.
- Price observations: immutable observations with amount, list/MRP, currency, unit, tax, shipping, installation, geography, availability, confidence and freshness.
- Normalization: canonical names, brands, categories, units, dimensions, material, finish and configuration.
- Matching: deterministic source identity first; cross-source equivalence only with evidence and confidence.
- Relationships: alternative, upgrade, downgrade, compatible, accessory and complementary relationships with evidence.
- Transparency: every displayed price must disclose source, observation time, unit, inclusions/exclusions and confidence/freshness state.
- Reliability: idempotent ingestion runs, accepted/rejected counts, error summaries, replayability and monitoring.
- Commercial safety: indicative/reference/observed/quoted prices must remain distinct; service and product prices must not be merged.

## Current implementation status

### Implemented foundation

- Source registry and expansion catalogue.
- 19 canonical categories.
- 500-source target and catalogue audit.
- Source access/eligibility fields.
- Market source, vendor, product, source-product, price observation, relationship, ingestion-run and evidence tables.
- Canonical normalization and duplicate suppression.
- Evidence and freshness fields.
- Confidence represented in basis points.
- Idempotency keys for ingestion runs.
- Integrity constraints for prices, confidence, currencies, units, freshness and relationship validity.

### Remaining gates before Step 2 completion

- Reach and verify 500+ unique sources; target is a quality gate, not merely a number in code.
- Verify every source's official domain and category assignment.
- Establish acquisition eligibility individually; do not activate sources solely because they are in the registry.
- Implement production adapters/importers for approved source classes.
- Populate representative real product/SKU observations across every category.
- Implement unit conversion and pack-size normalization.
- Implement tax/shipping/installation inclusion normalization.
- Implement city/region availability and localized pricing.
- Implement historical price snapshots and stale-price suppression.
- Implement cross-source product equivalence and alternatives with confidence/evidence.
- Add end-to-end ingestion persistence tests against PostgreSQL.
- Add operational monitoring/retry/replay and source-health metrics.
- Add consumer-facing provenance and price-semantic tests.
- Resolve Prisma schema/client parity for the market-intelligence tables before relying on generated Prisma types for those tables.
- Complete dependency/security audit independently of functional CI.

## Completion rule

Step 2 is complete only when the implementation gates above are demonstrably satisfied and the canonical CI gate is green on the final commit. A green CI run alone is not sufficient evidence of market-intelligence completeness.
