import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAIProvider } from "./provider";
import { GeminiAIProvider } from "./geminiProvider";

describe("getAIProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a provider that genuinely fails every call when AI_PROVIDER is unset - never a silent no-op", async () => {
    const provider = getAIProvider();

    await expect(
      provider.analyzeFloorPlan({
        jobId: "j",
        type: "ROOM_UNDERSTANDING",
        input: {},
      }),
    ).rejects.toThrow("AI_PROVIDER_NOT_CONFIGURED");
  });

  it("returns a real GeminiAIProvider when AI_PROVIDER=gemini and a key is present", () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "real-key";

    const provider = getAIProvider();

    expect(provider).toBeInstanceOf(GeminiAIProvider);
  });

  it("rejects with a real, specific error when gemini is selected but no API key is configured - never falls back silently", () => {
    process.env.AI_PROVIDER = "gemini";

    expect(() => getAIProvider()).toThrow("GEMINI_API_KEY_MISSING");
  });

  it("rejects an unrecognized provider name with a real, specific error naming it", () => {
    process.env.AI_PROVIDER = "some-other-provider";

    expect(() => getAIProvider()).toThrow(
      "AI_PROVIDER_UNSUPPORTED:some-other-provider",
    );
  });
});
