import { Queue } from "bullmq";
import IORedis from "ioredis";

export const NivasaJobQueue = "nivasa-jobs";
export type QueueJobType =
  | "ROOM_UNDERSTANDING"
  | "DESIGN_GENERATION"
  | "DESIGN_REVISION"
  | "THREE_D_SCENE"
  | "PANORAMA"
  | "WALKTHROUGH"
  | "VIDEO"
  | "BOQ_GENERATION"
  | "NOTIFICATION";

let queue: Queue | undefined;

export function getJobQueue() {
  if (queue) return queue;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_NOT_CONFIGURED");
  queue = new Queue(NivasaJobQueue, {
    connection: new IORedis(url, { maxRetriesPerRequest: null }),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: { age: 604800, count: 5000 },
    },
  });
  return queue;
}

export async function enqueueJob(input: {
  jobId: string;
  type: QueueJobType;
  payload: Record<string, unknown>;
}) {
  return getJobQueue().add(input.type, input.payload, { jobId: input.jobId });
}
