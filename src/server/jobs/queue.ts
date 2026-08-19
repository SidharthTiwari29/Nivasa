import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export type NivasaJobType =
  | 'FLOOR_PLAN_PROCESS'
  | 'FLOOR_PLAN_UNDERSTAND'
  | 'AI_DESIGN_GENERATION'
  | 'IMAGE_RENDER'
  | 'PANORAMA_RENDER'
  | 'SCENE_3D_RENDER'
  | 'WALKTHROUGH_RENDER'
  | 'VIDEO_RENDER'
  | 'BOQ_GENERATION'
  | 'NOTIFICATION';

export class QueueNotConfiguredError extends Error {
  readonly code = 'NOT_CONFIGURED';
}

let connection: IORedis | undefined;
let queues = new Map<NivasaJobType, Queue>();

function getConnection(): IORedis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new QueueNotConfiguredError('REDIS_URL: NOT_CONFIGURED');
  connection ??= new IORedis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: true });
  return connection;
}

export function getQueue(type: NivasaJobType): Queue {
  const existing = queues.get(type);
  if (existing) return existing;
  const queue = new Queue(type, {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: { age: 24 * 60 * 60, count: 1_000 },
      removeOnFail: { age: 7 * 24 * 60 * 60, count: 5_000 },
    },
  });
  queues.set(type, queue);
  return queue;
}

export async function enqueueIdempotent<T>(
  type: NivasaJobType,
  idempotencyKey: string,
  data: T,
): Promise<{ jobId: string }> {
  if (!idempotencyKey.trim()) throw new Error('INVALID_IDEMPOTENCY_KEY');
  const queue = getQueue(type);
  const job = await queue.add(type, data, { jobId: idempotencyKey });
  return { jobId: job.id ?? idempotencyKey };
}
