# Nivasa Product Experience Standard

## Purpose

Nivasa is not a collection of interior-design utilities. It is a home intelligence, design, commerce and execution platform. Every feature must improve the customer's journey from understanding a home to confidently building it.

## Product loop

**Intelligence → What-If/Savings → Smart Home → Buildability/BOQ → Localization/Assistant/Notifications → Commercial/Visualization → Walkthrough → Execution.**

No feature gets built just because it sounds exciting. Every feature must satisfy at least one of: customer value, decision quality, affordability, trust, buildability, conversion, execution reliability, or defensible Nivasa differentiation.

## Borrow from best-in-class product platforms

### 1. Make the README a product surface

Maintain a concise promise, capability map, architecture map, quick-start path, roadmap, changelog and clear status indicators. Documentation must distinguish **implemented**, **in progress**, **planned**, and **vision**.

### 2. Create Nivasa "experiences", not feature piles

Group capabilities into memorable journeys. The primary signature experiences are:

- **Nivasa DNA** — the persistent intelligence model of a customer's home, preferences, constraints, decisions and evolving design.
- **Nivasa Immersive** — an interactive, cinematic walkthrough that lets a customer experience the designed apartment as if entering and moving through every room and nook, rather than a flat slideshow.
- **Nivasa Smart Choice** — evidence-backed comparison of more options, better options, deals and substitutions.
- **Nivasa What-If** — instant cost/design trade-off exploration without losing the original design.
- **Nivasa BuildCheck** — buildability, BOQ and execution-risk validation before money is committed.

### 3. Zero-friction defaults

A customer uploading a floor plan should get useful progress without configuring dozens of inputs. Defaults should be safe, explainable and reversible. Advanced controls remain available for users who want precision.

### 4. Transparent decision-making

Whenever Nivasa recommends a product, material, layout change, vendor, deal or substitution, expose the reason in human language and preserve provenance. Never invent a price, availability claim, measurement or design constraint.

### 5. Optimization modes

Where appropriate, recommendation engines should support explicit goals such as:

- best overall
- best value
- lowest cost
- premium
- fastest execution
- highest confidence
- local-first
- sustainable
- balanced

The user chooses the objective; Nivasa does not silently optimize for the wrong one.

### 6. Resilience and graceful fallback

External providers, catalogues, renderers and execution partners can fail. Nivasa should fail closed for truth-sensitive operations, preserve the last known valid state, explain degraded capability, and offer an alternative route where safe.

### 7. Observability is a product capability

Track recommendation provenance, freshness, confidence, rendering status, job status, cost, latency, failures and execution state. A customer should understand what is happening without seeing internal complexity.

### 8. Extensible assistant and agent layer

Design Nivasa capabilities so the assistant can orchestrate domain actions through well-defined tools/services rather than embedding business logic in chat prompts. Future MCP/A2A-style integrations may expose safe, scoped Nivasa capabilities to approved agents and partners.

### 9. Multilingual and local-first experience

Language is a first-class product dimension. Customer-facing copy, assistant responses, notifications and important decision explanations should be localizable. Recommendations should account for geography, local suppliers, availability, delivery, serviceability and execution realities.

### 10. Memorable notifications

Notifications should be useful first and recognizably Nivasa second: concise, occasionally quirky, warm and brand-consistent. Never sacrifice clarity for humor. Examples include deal alerts, budget drift, design conflicts, render completion, buildability warnings and execution milestones.

## Quality gates for every experience

Before an experience is considered complete:

1. The user journey is defined end-to-end.
2. Domain rules are represented in code, not only prompts or documentation.
3. Important data has provenance and freshness semantics.
4. Recommendations are deterministic where they need to be deterministic.
5. Money uses exact arithmetic and explicit currency handling.
6. Security and ownership boundaries are tested.
7. Failure and degraded-provider paths are tested.
8. Accessibility and localization are considered.
9. Product copy explains decisions without exposing implementation jargon.
10. Unit/integration tests and CI pass.
11. The README/status documentation accurately reflects reality.

## Development discipline

Prefer a thin, complete vertical slice over disconnected stubs. Do not declare a capability complete because a database table, TypeScript interface or provider abstraction exists. Completion requires the user-visible behavior, domain logic, persistence/integration where required, tests and CI evidence.

## Competitive learning rule

Nivasa may borrow proven **patterns** from excellent products—zero-config defaults, flagship experiences, clear capability maps, operational dashboards, extensible tools, graceful fallback, transparent optimization and excellent documentation—but must not copy another project's implementation, branding, proprietary assets or domain-specific product design.

The objective is not to make Nivasa look like another successful project. The objective is to apply the best engineering and product lessons so Nivasa becomes unmistakably Nivasa.
