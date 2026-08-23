import type { Prisma, JobType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { enqueueJob } from "./queue";

const terminal = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);

export async function createAndEnqueueJob(input: {
  projectId: string;
  type: JobType;
  idempotencyKey: string;
  payload: Record<string, unknown>;
}) {
  const existing = await prisma.aIJob.findUnique({
    where: {
      projectId_idempotencyKey: {
        projectId: input.projectId,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });
  if (existing) return existing;

  const job = await prisma.aIJob.create({
    data: {
      projectId: input.projectId,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      input: input.payload as Prisma.InputJsonValue,
    },
  });
  try {
    await enqueueJob({
      jobId: job.id,
      type: input.type,
      payload: input.payload,
    });
    return job;
  } catch (error) {
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorCode: "QUEUE_UNAVAILABLE",
        errorMessage:
          error instanceof Error ? error.message : "Queue unavailable",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function transitionJob(input: {
  jobId: string;
  status: "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  provider?: string;
  providerJobId?: string;
  output?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}) {
  const current = await prisma.aIJob.findUniqueOrThrow({
    where: { id: input.jobId },
  });
  if (terminal.has(current.status)) return current;
  return prisma.aIJob.update({
    where: { id: input.jobId },
    data: {
      status: input.status,
      provider: input.provider,
      providerJobId: input.providerJobId,
      output: input.output as Prisma.InputJsonValue | undefined,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      startedAt: input.status === "RUNNING" ? new Date() : current.startedAt,
      completedAt: terminal.has(input.status) ? new Date() : undefined,
      attempts: { increment: input.status === "RUNNING" ? 1 : 0 },
    },
  });
}
