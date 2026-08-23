import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  getAIUsageSummary,
  listEntitlements,
  listJobs,
} from "./adminOperationsService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    package: { findMany: vi.fn() },
    entitlement: { findMany: vi.fn() },
    aIJob: { findMany: vi.fn(), groupBy: vi.fn() },
    catalogueItem: { findMany: vi.fn() },
  },
}));

const db = vi.mocked(prisma);

describe("adminOperationsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clamps entitlement and job list limits to the server maximum", async () => {
    db.entitlement.findMany.mockResolvedValue([] as never);
    db.aIJob.findMany.mockResolvedValue([] as never);

    await listEntitlements(5000);
    await listJobs(5000);

    expect(db.entitlement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 500 }),
    );
    expect(db.aIJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 500 }),
    );
  });

  it("normalizes missing providers in AI usage summaries", async () => {
    db.aIJob.groupBy.mockResolvedValue([
      { provider: null, status: "SUCCEEDED", _count: { _all: 3 } },
      { provider: "openai", status: "FAILED", _count: { _all: 1 } },
    ] as never);

    await expect(getAIUsageSummary()).resolves.toEqual([
      { provider: "unconfigured", status: "SUCCEEDED", jobs: 3 },
      { provider: "openai", status: "FAILED", jobs: 1 },
    ]);
  });
});
