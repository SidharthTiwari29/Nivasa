import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { enqueueJob } from "./queue";
import { createAndEnqueueJob, transitionJob } from "./jobService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    aIJob: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

vi.mock("./queue", () => ({ enqueueJob: vi.fn() }));

const jobs = vi.mocked(prisma.aIJob);
const enqueue = vi.mocked(enqueueJob);

describe("jobService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an existing idempotent job without creating or enqueueing another", async () => {
    const existing = { id: "job-1", status: "QUEUED" };
    jobs.findUnique.mockResolvedValue(existing as never);

    await expect(
      createAndEnqueueJob({
        projectId: "project-1",
        type: "DESIGN_GENERATION",
        idempotencyKey: "key-1",
        payload: { prompt: "modern" },
      }),
    ).resolves.toEqual(existing);
    expect(jobs.create).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("creates and enqueues a new job", async () => {
    jobs.findUnique.mockResolvedValue(null);
    jobs.create.mockResolvedValue({ id: "job-1" } as never);
    enqueue.mockResolvedValue({ id: "queue-job-1" } as never);

    await expect(
      createAndEnqueueJob({
        projectId: "project-1",
        type: "DESIGN_GENERATION",
        idempotencyKey: "key-1",
        payload: { prompt: "modern" },
      }),
    ).resolves.toEqual({ id: "job-1" });
    expect(jobs.create).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith({
      jobId: "job-1",
      type: "DESIGN_GENERATION",
      payload: { prompt: "modern" },
    });
  });

  it("does not mutate a terminal job", async () => {
    jobs.findUniqueOrThrow.mockResolvedValue({
      id: "job-1",
      status: "SUCCEEDED",
    } as never);

    await expect(
      transitionJob({ jobId: "job-1", status: "FAILED" }),
    ).resolves.toEqual({ id: "job-1", status: "SUCCEEDED" });
    expect(jobs.update).not.toHaveBeenCalled();
  });
});
