# Environment

Copy `.env.example` to `.env.local` for local development. Required production values include a PostgreSQL `DATABASE_URL`, a strong `NEXTAUTH_SECRET`, private object storage configuration, AI/render provider credentials when enabled, and payment webhook secrets.

Secrets must remain server-side. No API secret may be exposed through frontend code or public environment variables.

Payment processing remains disabled while `PAYMENT_PROVIDER=disabled` or provider credentials/webhook secrets are absent.
