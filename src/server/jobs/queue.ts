import { Queue } from "bullmq";
import IORedis from "ioredis";

let queue: Queue | undefined;

export function getAIQueue() {
  if (queue) return queue;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_NOT_CONFIGURED");
  const connection = new IORedis(url, { maxRetriesPerRequest: null });
  queue = new Queue("nivasa-ai", { connection });
  return queue;
}
