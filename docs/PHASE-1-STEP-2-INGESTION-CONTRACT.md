# Phase 1 Step 2 — Market Intelligence Ingestion Contract

## Pipeline

Source registry -> acquisition adapter -> raw evidence -> normalized product -> source SKU/variant -> price observation -> availability -> relationships -> budget reference.

## Adapter contract

Every source adapter must declare:

- source key
- acquisition method
- terms/access status
- supported categories
- geography
- retrieval timestamp
- freshness policy
- provenance policy

Each acquired record must preserve source URL/identifier and raw evidence reference before normalization.

## Product normalization

Canonical products are separated from source-specific listings. A source listing may map to an existing canonical product or create a new one. Seller identity is retained for marketplaces. Variant/configuration differences must never be collapsed merely because titles are similar.

## Price observations

Prices are append-only observations. Never overwrite prior observations. Store amount in integer minor units, currency, unit, observed-at timestamp, effective period when known, location, tax/shipping/installation inclusion, source listing, evidence and confidence/freshness status.

## Truth semantics

SOURCE_OBSERVED = directly represented by permitted source evidence.
VERIFIED = independently validated according to a documented verification rule.
ESTIMATE = Nivasa-derived range or calculation.
RECOMMENDATION = Nivasa selection/ranking and must never masquerade as a source fact.

## Idempotency

Acquisition and normalization must be safe to retry. Source record identity plus source-specific stable identifiers and observation fingerprints must prevent duplicate observations while allowing legitimate price changes to append new observations.

## Small components

Products may have component/part relationships. Examples include wardrobe hinges, channels, handles, lifts and baskets; kitchen hardware; faucets/diverters/concealed systems; lighting profiles/drivers; switches/sockets; ceiling systems; boards/laminates and installation components.

## Compliance

No adapter may bypass robots/access controls, authentication barriers, rate limits or licensing restrictions. Use official APIs/feeds, partner/licensed data, permitted public extraction, manual imports or vendor/user-provided data as appropriate. A source that cannot be automatically acquired remains a valid registry source with its approved acquisition route recorded.
