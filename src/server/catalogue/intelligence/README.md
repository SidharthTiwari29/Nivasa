# Catalogue Intelligence

This package is the evidence-backed decision layer for Nivasa.

## Flow

`Source → Evidence → Observation → Canonical Product → Variant → Catalogue identity → Recommendation → Deal → Substitution`

## Rules

1. Recommendations must be explainable.
2. Prices are never invented; every market price is tied to an observation and evidence.
3. Confidence is bounded to 0–10,000 basis points.
4. Availability is explicit.
5. Substitution never silently replaces the customer's selection.
6. Ranking is deterministic so the same evidence produces the same decision.
7. Provider/API integration belongs outside the pure decision functions.
8. Currency must match before prices are compared.
9. A verified deal requires a verified observation and verification timestamp; otherwise the result is a `POTENTIAL_SAVING`.
10. Historical observations remain immutable; decision reads select current/fresh observations without deleting history.

## Better deals (§16)

The persisted decision path currently supports **exact variant/SKU comparisons**: a selected market observation must identify a `ProductVariant`, and competing observations are restricted to that same variant, with optional geography filtering. This prevents superficially similar products from being presented as the same SKU.

The API exposes the saving amount and saving basis points. It distinguishes `VERIFIED_DEAL` from `POTENTIAL_SAVING` rather than turning weak or unverified evidence into a claim of a genuine deal.

## Substitution intelligence (§17)

The persisted decision path currently supports **same-canonical-product variant substitutions**. Candidate variants are compared against the selected variant using their explicit attributes and market observations. The response reports:

- price delta
- potential saving
- lower-cost / unavailable / better-confidence reasons
- explicit attribute changes
- a `NOT_ESTABLISHED` trade-off status where quality, durability, maintenance or visual impact has not been backed by evidence

Cross-canonical-product equivalent-specification substitutions are intentionally not inferred from names or category alone. They require a later explicit comparability/relationship contract and evidence rather than heuristic guessing.

## Product modes

- `BEST_VALUE`: balances price, confidence, quality, availability and locality.
- `LOWEST_COST`: strongly prioritises price while retaining confidence and availability.
- `PREMIUM`: prioritises quality and evidence confidence.
- `FASTEST`: prioritises delivery speed and availability.
- `LOCAL_FIRST`: prioritises local availability while retaining price and confidence.

This layer is intentionally independent of any specific marketplace, retailer or AI provider.
