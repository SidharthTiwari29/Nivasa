import type { Prisma, JobType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { enqueueJob } from "./queue";
import { computeVisualizationPriority } from "./visualizationPriority";
import {
  reserveCredits,
  confirmReservation,
  releaseReservation,
} from "@/server/services/entitlements";

const terminal = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);

// Only these job types actually produce visual output where render order
// is user-visible - a ROOM_UNDERSTANDING or DESIGN_GENERATION job has no
// equivalent "which one should the user see first" concern, so priority
// computation is skipped for those rather than applying a meaningless
// number.
const VISUALIZATION_JOB_TYPES: readonly JobType[] = [
  "THREE_D_SCENE",
  "PANORAMA",
  "WALKTHROUGH",
  "VIDEO",
];

async function resolveJobPriority(
  type: JobType,
  projectId: string,
): Promise<number | undefined> {
  if (!VISUALIZATION_JOB_TYPES.includes(type)) return undefined;

  const project = await prisma.designProject.findUnique({
    where: { id: projectId },
    select: { roomId: true },
  });
  if (!project?.roomId) return computeVisualizationPriority(null);

  const latestUnderstanding = await prisma.roomUnderstanding.findFirst({
    where: { roomId: project.roomId },
    orderBy: { version: "desc" },
    select: { status: true, confidenceBps: true },
  });

  return computeVisualizationPriority(latestUnderstanding);
}

// One AI credit per job, flat rate - the actual per-job-type cost model
// (a walkthrough is presumably more expensive to generate than a single
// design revision) is a real product/pricing decision to make later; this
// establishes the mechanism (reserve -> confirm/release) correctly first,
// which is the harder problem, rather than guessing at pricing tiers no
// one has decided yet.
const CREDITS_PER_JOB = 1;

export async function createAndEnqueueJob(input: {
  projectId: string;
  ownerId: string;
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

  // Reserve BEFORE creating the job record - if the user has insufficient
  // credits, reserveCredits throws and no job is ever created or queued.
  // The reservation's own idempotency key is derived from the job's, so a
  // retried submission with the same idempotencyKey reuses the same
  // reservation rather than reserving credits twice for one logical
  // request.
  const reservation = await reserveCredits(
    input.ownerId,
    CREDITS_PER_JOB,
    `job:${input.projectId}:${input.idempotencyKey}`,
  );

  const job = await prisma.aIJob.create({
    data: {
      projectId: input.projectId,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      creditReservationId: reservation.id,
      input: input.payload as Prisma.InputJsonValue,
    },
  });
  try {
    const priority = await resolveJobPriority(input.type, input.projectId);
    await enqueueJob({
      jobId: job.id,
      type: input.type,
      payload: input.payload,
      priority,
    });
    return job;
  } catch (error) {
    // The job never made it to the queue - release the reservation
    // immediately rather than leaving the user's credits held against a
    // job that will never run and whose own terminal-state transition
    // will therefore never fire to release them itself.
    await releaseReservation(reservation.id);
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
  // The terminal-state guard below (return early if already terminal)
  // does double duty: it's what stops a job's status from regressing
  // after completion, and it's also what guarantees confirmReservation/
  // releaseReservation can only ever fire once per job - a worker retry
  // or duplicate delivery calling transitionJob again for an already-
  // terminal job hits this return and never touches the reservation a
  // second time.
  if (terminal.has(current.status)) return current;

  const updated = await prisma.aIJob.update({
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

  if (current.creditReservationId && terminal.has(input.status)) {
    if (input.status === "SUCCEEDED") {
      await confirmReservation(current.creditReservationId);
    } else {
      await releaseReservation(current.creditReservationId);
    }
  }

  return updated;
}
