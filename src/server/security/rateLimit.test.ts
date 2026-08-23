import { beforeEach, describe, expect, it, vi } from "vitest";

const { incr, expire } = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
}));

vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({ incr, expire })),
}));

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    incr.mockReset();
    expire.mockReset();
    delete process.env.REDIS_URL;
  });

  it("fails closed when Redis is not configured", async () => {
    const { consumeRateLimit } = await import("./rateLimit");
    await expect(
      consumeRateLimit({ key: "test", limit: 10, windowSeconds: 60 }),
    ).rejects.toThrow("REDIS_NOT_CONFIGURED");
  });

  it("allows requests within the limit and initializes the window", async () => {
    process.env.REDIS_URL = "redis://example";
    incr.mockResolvedValue(1);
    expire.mockResolvedValue(1);

    const { consumeRateLimit } = await import("./rateLimit");
    await expect(
      consumeRateLimit({ key: "user-1", limit: 10, windowSeconds: 60 }),
    ).resolves.toEqual({ allowed: true, remaining: 9, count: 1 });
    expect(incr).toHaveBeenCalledWith("ratelimit:user-1");
    expect(expire).toHaveBeenCalledWith("ratelimit:user-1", 60);
  });

  it("denies requests after the limit is exceeded", async () => {
    process.env.REDIS_URL = "redis://example";
    incr.mockResolvedValue(11);

    const { consumeRateLimit } = await import("./rateLimit");
    await expect(
      consumeRateLimit({ key: "user-1", limit: 10, windowSeconds: 60 }),
    ).resolves.toEqual({ allowed: false, remaining: 0, count: 11 });
    expect(expire).not.toHaveBeenCalled();
  });
});
