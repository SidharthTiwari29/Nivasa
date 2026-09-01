import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // The Prisma CLI (migrate, db seed, etc.) needs a DIRECT database
    // connection - pooled connections (Neon, Supabase, PgBouncer-style)
    // can fail on schema-changing operations like CREATE TABLE. This is
    // deliberately a SEPARATE variable from DATABASE_URL, which the
    // running app uses via the PrismaPg driver adapter
    // (src/server/db/prisma.ts) and CAN safely be the pooled connection
    // string. Falls back to DATABASE_URL for local development where
    // there's often no separate pooler at all.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/niwasthan",
  },
});
