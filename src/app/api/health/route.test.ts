import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/prisma", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { prisma } from "@/server/db/prisma";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("reports ready when the database probe succeeds", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ ok: 1 }] as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("ok");
    expect(body.readiness).toBe("ready");
    expect(body.checks.database).toBe("ok");
    expect(body.latencyMs).toEqual(expect.any(Number));
  });

  it("returns a safe 503 when the database probe fails", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error("database credentials must never be exposed"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      status: "degraded",
      readiness: "not_ready",
      checks: { database: "failed" },
    });
    expect(JSON.stringify(body)).not.toContain("credentials");
  });
});
