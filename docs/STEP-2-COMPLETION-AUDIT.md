# Step 2 Completion Audit

Step 2 is complete only when Budget Reality and market/product intelligence are executable, persisted, authorized, tested, integrated and verified by the full CI gate.

Required pipeline: source discovery → governance → compliant acquisition → raw evidence → normalization → canonical product → source SKU/variant → price observation → geography/unit/tax semantics → historical observations → cross-source matching → alternatives → confidence/freshness → provenance → user-facing explanation.

Required product coverage includes furniture, kitchens, wardrobes, storage, hardware, boards, laminates/veneer, stone/surfaces, tiles/flooring, paint/wall finishes, ceilings/acoustics, sanitaryware/plumbing, electrical, lighting/fans, appliances, smart-home devices, doors/windows/glass, curtains/blinds/rugs/furnishings, mattresses/soft goods, decor/accessories, art/paintings/murals/sculptures, mandir/pooja, outdoor/balcony/garden, local fabrication and services.

Non-negotiable integrity: no invented product facts; no unsupported warranty claims; no estimate presented as verified price; exact SKU claims require evidence; product images require evidenced product/variant; recommendations expose rationale/trade-offs; alternatives are comparable; provenance and freshness remain available; acquisition respects access rules, licensing, robots directives and applicable law.

Budget requirements: versioning, ownership, idempotency, immutable locking/history, low/target/high deterministic integer-INR arithmetic, provenance, assumptions, Home Intelligence/Home DNA references and What-If consumption.

Market intelligence requirements: governed source registry, compliant adapters, raw evidence, canonical product/SKU identity, immutable price observations/history, unit/geography/tax/shipping/installation semantics, confidence/freshness, cross-source matching, alternatives, recommendation rationale, replay/idempotency and monitoring foundations.

Implementation contract: model → migration → repository → service → API → authorization → tests → integration → CI → merge.

Authoritative CI: npm ci → format:check → lint → prisma generate → typecheck → test → prisma validate → build → git diff --check.

Do not merge or declare Step 2 complete until the final PR head passes every gate and all requirements above are evidenced by executable implementation and tests.