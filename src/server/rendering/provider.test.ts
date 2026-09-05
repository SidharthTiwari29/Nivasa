import { afterEach, describe, expect, it, vi } from "vitest";
import { getRenderingProvider } from "./provider";

describe("HTTP rendering provider", () => {
  const original = {
    provider: process.env.RENDERING_PROVIDER,
    url: process.env.RENDERING_PROVIDER_URL,
    key: process.env.RENDERING_PROVIDER_API_KEY,
    timeout: process.env.RENDERING_PROVIDER_TIMEOUT_MS,
  };

  afterEach(() => {
    vi.restoreAllMocks();
    if (original.provider === undefined) delete process.env.RENDERING_PROVIDER;
    else process.env.RENDERING_PROVIDER = original.provider;
    if (original.url === undefined) delete process.env.RENDERING_PROVIDER_URL;
    else process.env.RENDERING_PROVIDER_URL = original.url;
    if (original.key === undefined) delete process.env.RENDERING_PROVIDER_API_KEY;
    else process.env.RENDERING_PROVIDER_API_KEY = original.key;
    if (original.timeout === undefined) delete process.env.RENDERING_PROVIDER_TIMEOUT_MS;
    else process.env.RENDERING_PROVIDER_TIMEOUT_MS = original.timeout;
  });

  it("returns an unconfigured provider when no provider is selected", async () => {
    delete process.env.RENDERING_PROVIDER;
    await expect(getRenderingProvider().submit({ jobId: "j", type: "VIDEO", input: {} })).rejects.toThrow(
      "RENDERING_PROVIDER_NOT_CONFIGURED",
    );
  });

  it("submits and polls through the configured HTTP provider", async () => {
    process.env.RENDERING_PROVIDER = "http";
    process.env.RENDERING_PROVIDER_URL = "https://renderer.example.com/";
    process.env.RENDERING_PROVIDER_API_KEY = "secret";

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ providerJobId: "render-123" }), { status: 202 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "SUCCEEDED" }), { status: 200 }),
      );

    const provider = getRenderingProvider();
    await expect(provider.submit({ jobId: "j", type: "VIDEO", input: { quality: "4K" } })).resolves.toEqual({
      provider: "http",
      providerJobId: "render-123",
    });
    await expect(provider.getStatus("render-123")).resolves.toBe("SUCCEEDED");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://renderer.example.com/renders",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer secret" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://renderer.example.com/renders/render-123",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects invalid provider configuration", () => {
    process.env.RENDERING_PROVIDER = "http";
    delete process.env.RENDERING_PROVIDER_URL;
    expect(() => getRenderingProvider()).toThrow("RENDERING_PROVIDER_URL_REQUIRED");
  });
});
