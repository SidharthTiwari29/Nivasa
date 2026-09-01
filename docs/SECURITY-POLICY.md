# Security Policy

> This document describes security measures **actually implemented in the codebase as of this commit**, verified by reading the source directly — not aspirational claims. Sections marked "Not yet implemented" are genuine, named gaps, not oversights being glossed over.

## 1. User account security

- **Authentication**: Auth.js with Google OAuth and email sign-in, session strategy is JWT.
- **Authorization**: every server-side operation resolves the caller's session and role (`USER`/`DESIGNER`/`ADMIN`/`SUPER_ADMIN`) via `requireAuth`/`requireAdmin`. Ownership is enforced at the repository query level (e.g., `WHERE ownerId = callerId` baked into the query itself, not checked-then-trusted afterward), so a caller cannot access another user's Property/Room/Budget/Order by guessing an ID.
- **Privilege escalation prevention**: an `ADMIN` cannot grant `ADMIN`/`SUPER_ADMIN` role to another account — only a `SUPER_ADMIN` can. Verified by test (`governance.test.ts` / `adminUserService.test.ts`).
- **Password handling**: not applicable — the system uses OAuth/magic-link email authentication, not password storage.

**Not yet implemented**: multi-factor authentication, session revocation on suspicious activity, account lockout after repeated failed sign-in attempts.

## 2. API and infrastructure security

- **Rate limiting**: implemented via Redis-backed sliding counters (`consumeRateLimit`) on the Razorpay webhook, payment order creation, and quote submission endpoints. **Not yet applied to every endpoint** — this should be extended as a standing practice to any endpoint that accepts unauthenticated or high-frequency input.
- **Input validation**: every API route validates request bodies/params through Zod schemas (`parseOrThrow`) before any business logic runs — malformed or unexpected input is rejected with a structured 422 error, not passed through.
- **SQL injection**: all database access goes through Prisma's parameterized query builder or explicitly parameterized `Prisma.sql` tagged templates (used for the few tables without a typed Prisma model) — no string-concatenated SQL exists anywhere in the codebase.
- **Secrets management**: environment variables for all credentials (`DATABASE_URL`, `RAZORPAY_*`, `REDIS_URL`, etc.); `.env.example` contains only placeholder values; real secrets are never committed.

**Not yet implemented**: Web Application Firewall / DDoS protection at the infrastructure layer, dependency vulnerability scanning as a CI gate, a full security-headers audit beyond the basics currently in `next.config.mjs`.

## 3. Payment security

- **No client-side trust for payment success.** Entitlements/purchases are activated **only** after Razorpay's webhook is received and its HMAC-SHA256 signature is verified server-side (`verifyRazorpayWebhookSignature`, tested against both authentic and forged signatures). A client reporting "payment succeeded" cannot unlock a paid feature on its own.
- **Webhook idempotency**: repeated delivery of the same webhook event (which Razorpay can do) does not double-activate an entitlement — enforced by conditional database updates keyed on the transaction reference, not a simple "if not exists, create" check that could race.
- **No raw card/UPI data stored.** All payment method details are handled by Razorpay directly; Niwasthan's database only stores transaction metadata (amount, status, references).

**Not yet implemented**: PCI-DSS formal compliance documentation (likely not required if no card data ever touches Niwasthan's servers, but should be confirmed with Razorpay's own compliance guidance and, ideally, a qualified auditor).

## 4. Organizational/data-access security

- **Role-based access control** for administrative operations — `ADMIN`/`SUPER_ADMIN` roles gate source-registry management, catalogue substitution curation, and user role management, each independently tested for the negative case (non-admin rejected).
- **Audit logging**: privileged actions (role changes, account deletion) are recorded in `AuditLog` with the actor, action, and timestamp.
- **Data retention/deletion**: see the [Data Retention and Deletion Policy](./DATA-RETENTION-AND-DELETION-POLICY.md) — financial/audit records are retained per legal requirements even after a user requests deletion; the user's identity is anonymized, not the retained record.

**Not yet implemented**: a formal incident response plan, a security-event monitoring/alerting system (currently, a security-relevant event like a repeated failed authorization check produces a log line, not an alert), a documented vulnerability disclosure/bug-bounty process.

## 5. Known, currently-open gaps — stated plainly, not hidden

1. Rate limiting is not yet applied uniformly across all endpoints — only payments and quote submission currently have it.
2. No automated dependency vulnerability scanning exists in CI (e.g., `npm audit` as a blocking gate, Dependabot/Snyk integration).
3. No formal penetration test has been performed on this codebase.
4. Production infrastructure (hosting, network security, secrets vaulting) has not been finalized — the security posture of the actual deployed environment cannot be assessed until that infrastructure exists.

This list should be treated as a live backlog, not a footnote — each item is a real, trackable piece of work.
