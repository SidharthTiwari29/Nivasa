import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        readiness: "ready",
        checks: { database: "ok" },
        latencyMs: Date.now() - startedAt,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        readiness: "not_ready",
        checks: { database: "failed" },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
