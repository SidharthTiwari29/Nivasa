# Phase 1 Step 2 — Production Market Intelligence Ingestion Contract

This is the single canonical ingestion contract. It must serve every source without source-specific duplicate pipelines.

## Pipeline

Source registry -> acquisition adapter -> raw evidence -> normalized canonical product -> source listing/SKU/variant -> append-only price observation -> availability -> component/alternative relationships -> budget reference.

## Adapter contract

Every adapter declares source key, acquisition method, terms/access status, supported categories, geography, retrieval timestamp, freshness policy and provenance policy. Every acquired record preserves source URL/identifier and immutable raw-evidence reference before normalization.

## Product model

Canonical products are independent of source listings. A source listing maps to a canonical product or creates one. Marketplace seller identity is preserved. Variant/configuration differences are never collapsed solely by title similarity. Components and parts are first-class relationships.

## Price model

Every observation stores integer minor-unit amount, currency, unit, observed-at timestamp, effective period when known, location, tax/shipping/installation inclusion, source listing, evidence and confidence/freshness. Observations are append-only; a changed price creates a new observation.

## Truth semantics

SOURCE_OBSERVED = directly represented by permitted source evidence.
VERIFIED = independently validated under a documented rule.
ESTIMATE = Niwasthan-derived calculation/range.
RECOMMENDATION = Niwasthan ranking/selection and never a source fact.

## Retry/idempotency

Source identity + stable source listing identifiers + observation fingerprints make ingestion retry-safe. Legitimate price changes remain distinct historical observations.

## Component coverage

Support small components wherever exposed: wardrobe hinges/channels/handles/lifts/baskets; kitchen hardware; faucets/diverters/concealed systems; showers/sinks/accessories; lighting profiles/drivers; switches/sockets; ceiling systems; boards/laminates; glass/door hardware; installation components.

## Compliance

Adapters may use official APIs/feeds, partner/licensed datasets, permitted public extraction, manual imports or vendor/user-provided data according to the source's terms, access controls, licensing and applicable law. Never bypass authentication, robots/access controls or rate limits. A source that cannot be automatically acquired remains supported through its approved non-automated acquisition method.
