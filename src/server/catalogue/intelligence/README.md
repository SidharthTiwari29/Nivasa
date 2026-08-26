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

## Product modes

- `BEST_VALUE`: balances price, confidence, quality, availability and locality.
- `LOWEST_COST`: strongly prioritises price while retaining confidence and availability.
- `PREMIUM`: prioritises quality and evidence confidence.
- `FASTEST`: prioritises delivery speed and availability.
- `LOCAL_FIRST`: prioritises local availability while retaining price and confidence.

This layer is intentionally independent of any specific marketplace, retailer or AI provider.
