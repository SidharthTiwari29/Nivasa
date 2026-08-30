# Privacy Policy (Draft)

> **This is an engineering draft, not a published legal document.** It must be reviewed, revised, and approved by qualified legal counsel before being shown to any real user. It is written to accurately describe what the system actually does as of this commit — not to be legally complete or sufficient on its own.

**Last updated:** [DATE TO BE SET ON ACTUAL PUBLICATION]

## 1. Who this applies to

This policy applies to anyone who creates an account on Nivasa ("the Service"), a home-interior design platform.

## 2. What we collect

- **Account information**: email address, name, profile image (via Google OAuth or email sign-in).
- **Property and design data you provide**: floor plans, room photographs, room dimensions, design preferences, budget information — this is the core content you create using the Service.
- **Payment information**: processed through Razorpay; Nivasa does not store your raw card/UPI details — only transaction records (amount, status, order reference).
- **Usage and audit data**: actions taken on your account are logged for security and support purposes (see `AuditLog` in the Data Retention Policy).

## 3. How we use it

- To provide the core Service: storing your property/design/budget data so you can access and edit it.
- To process payments for paid features via Razorpay.
- To connect you with suppliers if you use the procurement/RFQ feature — supplier-facing information (e.g., a quote request) may include details of your design or budget scope necessary for the supplier to respond.
- To send you notifications about your own account activity (order status, quote received, execution updates) — see the Notification system.

## 4. What we do not do

- We do not sell your personal data to third parties.
- We do not display advertisements or share your data with advertisers.
- [TO BE CONFIRMED WITH COUNSEL: any additional commitments Nivasa wants to make]

## 5. Third parties who may process your data

- **Razorpay** (payments) — subject to Razorpay's own privacy policy for payment processing.
- **[AI/rendering provider — not yet selected]**: once a real visualization provider is integrated, this section must name it and describe what design data is sent to it.
- **[Hosting/infrastructure provider — not yet finalized]**: must be named once production infrastructure is decided.

## 6. Your rights

- **Access**: you can view your own data through the Service at any time.
- **Deletion**: you may request account deletion. See the Data Retention and Deletion Policy for exactly what is deleted versus anonymized-and-retained, and why.
- **Portability**: not yet implemented as a self-service feature — currently requires contacting support directly. [ENGINEERING NOTE: build a self-service data export feature before this can honestly be called supported.]
- **Correction**: you can edit most of your own data directly through the Service.

## 7. Security

See the Security Policy for details on how your data is protected, including authentication, authorization, and payment security measures.

## 8. Children's privacy

Under the DPDP Act, processing a child's (under-18) personal data requires **verifiable parental or lawful guardian consent** before collection. Nivasa's current sign-up flow has no age-verification or parental-consent mechanism. **Until one is built, the Service should explicitly restrict sign-up to users 18 and older** — this needs both a Terms clause and an actual technical/process control, not just a policy statement.

## 9. Changes to this policy

[TO BE DEFINED WITH COUNSEL: notice period and method for policy changes.]

## 10. Contact

[TO BE FILLED IN: a real support/legal contact email once the business entity and its registered contact details are finalized.]

---

**Engineering honesty note**: every bracketed `[...]` placeholder above represents a real, unresolved decision or unbuilt feature — not filler text to be silently removed. This document should not be published with any bracket still present.
