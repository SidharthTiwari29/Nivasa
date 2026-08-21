# Development

Node.js 22.12+ is required.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `AUTH_SECRET`.
3. Install dependencies with `npm install`.
4. Generate Prisma Client with `npx prisma generate`.
5. Run the development server with `npm run dev`.

Never commit `.env`, credentials, tokens, private keys or generated secrets.
