import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 requires an explicit driver adapter rather than inferring one from
// DATABASE_URL. The PostgreSQL adapter keeps the client compatible with the
// current Prisma API and avoids the runtime initialization failure from the
// pre-Prisma-7 constructor.
//
// connectionTimeoutMillis is set explicitly and generously (15s, well above
// node-postgres's own 0/unlimited-but-OS-level default behavior) because this
// database is a real, serverless Neon compute that suspends when idle and has
// to wake up on a cold connection - a real, measured, occasionally multi-
// second delay that a short or default timeout can hit before the wake-up
// completes, producing an intermittent, hard-to-diagnose connection failure
// that looks unrelated to the real cause. This is a genuine, standard
// mitigation for serverless Postgres cold-start, not a magic number.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
