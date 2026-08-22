import IORedis from "ioredis";

let redis: IORedis | undefined;
function getRedis() {
  if (redis) return redis;
  if (!process.env.REDIS_URL) throw new Error("REDIS_NOT_CONFIGURED");
  redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  return redis;
}

export async function consumeRateLimit(input: { key: string; limit: number; windowSeconds: number }) {
  if (!Number.isInteger(input.limit) || input.limit <= 0) throw new Error("INVALID_RATE_LIMIT");
  const client = getRedis();
  const key = `ratelimit:${input.key}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, input.windowSeconds);
  return { allowed: count <= input.limit, remaining: Math.max(0, input.limit - count), count };
}
