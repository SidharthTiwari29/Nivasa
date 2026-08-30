# Terms of Service (Draft)

> **This is an engineering draft, not a published legal document.** It must be reviewed, revised, and approved by qualified legal counsel — and by whoever owns Nivasa's actual business/liability decisions — before being shown to any real user.

**Last updated:** [DATE TO BE SET ON ACTUAL PUBLICATION]

## 1. What Nivasa is

Nivasa is a platform for planning, budgeting, and procuring home interior design work. It provides design intelligence, budget estimation, and (where you choose to use it) connects you with third-party suppliers for quotes and orders.

## 2. What Nivasa is not, and does not guarantee

- **Estimates, not guarantees.** Budget figures (Low/Target/High) are estimates derived from the data you provide and Nivasa's catalogue/market data. Actual costs may differ. [ENGINEERING NOTE: this must match the actual behavior of `BudgetVersion`/`BudgetPlan` — the system explicitly labels figures as estimates with confidence bounds, not guaranteed prices; this clause should stay consistent with that design.]
- **Supplier relationships are between you and the supplier.** When you use the procurement/RFQ feature, Nivasa facilitates the connection (RFQ → Quote → Order) but the contract for goods/services is between you and the supplier. Nivasa is not a party to that contract unless explicitly stated otherwise for a specific supplier arrangement. [TO BE CONFIRMED WITH COUNSEL: does Nivasa want to take on any liability/warranty role here, or remain purely a facilitator?]
- **No warranty on AI-generated content**, if/when a real visualization provider is integrated — generated images are illustrative, not architectural guarantees. [ENGINEERING NOTE: this must be enforced in the UI once visualization is built, per README §20's "must be clearly identified as illustrative" requirement.]

## 3. Payments

- Paid features are processed via Razorpay. All payment activation happens only after Razorpay's webhook confirms a verified transaction — no feature is unlocked based on a client-side "success" signal alone. [This reflects the actual server-side verification already implemented in `purchaseService.ts`.]
- Refund policy: [TO BE DEFINED — no refund logic currently exists in the codebase; this needs a real business decision before publication.]

## 4. Your account

- You are responsible for the accuracy of the property, room, and design information you provide.
- You may delete your account at any time. See the Privacy Policy and Data Retention Policy for what happens to your data when you do.
- [TO BE DEFINED WITH COUNSEL: account suspension/termination conditions for abuse, non-payment, or policy violation.]

## 5. Intellectual property

- You retain ownership of the design content you create.
- [TO BE DEFINED WITH COUNSEL: what rights, if any, Nivasa needs to your data to operate the Service — e.g., to display it back to you, to generate visualizations, to share necessary scope details with a supplier you've engaged.]
- Nivasa's own catalogue data, market intelligence, and platform software remain Nivasa's property.

## 6. Limitation of liability

[TO BE DEFINED WITH COUNSEL: this is a standard but legally significant clause that should not be drafted by engineering. Placeholder only.]

## 7. Governing law

[TO BE DEFINED WITH COUNSEL: jurisdiction, likely India given the product's INR-only, India-focused design, but must be confirmed.]

## 8. Changes to these terms

[TO BE DEFINED WITH COUNSEL: notice period and method for changes.]

## 9. Contact

[TO BE FILLED IN: real registered business contact.]

---

**Engineering honesty note**: every bracketed `[...]` placeholder represents a real, unresolved legal or business decision. This document should not be published with any bracket still present. Several clauses above are deliberately written to match what the code actually does today (e.g., payment verification, estimate labeling) — if the code changes, these clauses need to change with it, not drift out of sync.
