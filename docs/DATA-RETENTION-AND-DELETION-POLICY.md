# Data Retention and Deletion Policy

> **Status: engineering draft, not legal advice.** This document describes what the system's code actually does today. It must be reviewed and approved by qualified legal counsel — particularly for compliance with India's Digital Personal Data Protection Act, 2023 (DPDP Act) and any tax/audit record-retention rules applicable to Nivasa's business — before being published to users or relied upon as a compliance statement.

## 1. Principle

Nivasa distinguishes between:

- **Personal content the user created and controls** — deleted on request.
- **Transactional and audit records Nivasa is legally required to retain** — never deleted on request; the user's identity is disconnected from them instead (anonymization), not the record itself.

A user's "right to erasure" is not absolute where a legal retention obligation exists. This is the standard, defensible position under most data protection regimes, including DPDP — but the exact retention periods below are placeholders and **must be confirmed against actual Indian tax, GST, and financial-record-keeping law by counsel**, not assumed from this document.

## 2. What is hard-deleted on account deletion

Implemented in `accountDeletionService.deleteAccount`:

- `Property` and everything cascading from it in the schema (`Room`, `FloorPlan`, `DesignProject`, `DesignVersion`, `DesignRevision`, `HomeIntelligence`, `HomeDnaVersion`, `RoomUnderstanding`, and any `Asset` only referenced through these) — a user's actual home data, floor plans, and design work.
- `Notification` records belonging to the user.

## 3. What is retained, with the user anonymized instead

- `Payment`, `Purchase`, `Entitlement`, `AuditLog` — financial and audit records. **Placeholder retention period: 7 years**, matching common Indian tax record-keeping expectations — **this number is not verified against actual law and must be confirmed by counsel before publication.**
- `ProcurementRequest`, `Quote`, `Order`, `ExecutionRecord` — commercial transaction history with suppliers, retained for the same reason (a completed purchase/order is a business record, not purely personal content).
- The `User` row itself is never deleted (many retained records reference it via foreign key). Instead, `email`/`name`/`image` are overwritten with a stable, non-identifying placeholder derived from the user's own id (`{userId}@deleted.nivasa.local`), so the linkage between retained records and a real identifiable person is severed.

## 4. Idempotency and auditability

- Deletion is idempotent: re-running it against an already-anonymized account is a no-op, not an error. This matters because deletion requests may be retried (a queued job retry, a user re-submitting the same request).
- The deletion event itself (`ACCOUNT_DELETED`, who requested it, when) is recorded in `AuditLog`. This is a record of an administrative event, not personal data, and is retained for the same audit reasons as other `AuditLog` entries.

## 5. What this policy does not yet cover — genuine open items

- **Data export ("right to portability")**: not yet implemented. A user should be able to download their own Property/Design/Budget data in a structured format before or instead of deletion. This is a real, near-term engineering task, not yet built.
- **Backup retention**: this policy describes the primary database. Any database backups, log aggregation, or analytics systems that separately retain copies of this data are **not yet covered** and need their own retention/deletion procedure before this policy can be called complete.
- **Sub-processor data**: any third-party service Nivasa sends user data to (a future AI/rendering provider, a payment processor, an email provider) has its own retention practices that must be documented here once those integrations exist for real.
- **Consent withdrawal for marketing communications**, if Nivasa ever sends any, is not addressed here.

## 6. Verification

The behavior described in sections 2–4 is implemented and tested in `src/server/privacy/accountDeletionService.ts` / `accountDeletionService.test.ts`. This document should be kept in sync with that code — if the code changes, this document must be updated in the same change, and vice versa.
