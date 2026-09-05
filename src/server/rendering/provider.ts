export type RenderType =
  | "DESIGN_IMAGE"
  | "PANORAMA"
  | "THREE_D_SCENE"
  | "WALKTHROUGH"
  | "VIDEO"
  | "BEFORE_AFTER";

export type RenderRequest = {
  jobId: string;
  type: RenderType;
  input: Record<string, unknown>;
};

export type RenderSubmission = {
  providerJobId: string;
  provider: string;
};

export type RenderStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface RenderingProvider {
  submit(request: RenderRequest): Promise<RenderSubmission>;
  getStatus(providerJobId: string): Promise<RenderStatus>;
}

type ProviderResponse = {
  providerJobId?: unknown;
  id?: unknown;
  status?: unknown;
};

const readJson = async (response: Response): Promise<ProviderResponse> => {
  const body = (await response.json().catch(() => ({}))) as ProviderResponse;
  if (!response.ok) {
    throw new Error(`RENDERING_PROVIDER_HTTP_${response.status}`);
  }
  return body;
};

const asJobId = (body: ProviderResponse): string => {
  const value = body.providerJobId ?? body.id;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("RENDERING_PROVIDER_JOB_ID_MISSING");
  }
  return value;
};

const asStatus = (value: unknown): RenderStatus => {
  if (
    value === "QUEUED" ||
    value === "RUNNING" ||
    value === "SUCCEEDED" ||
    value === "FAILED"
  ) {
    return value;
  }
  throw new Error("RENDERING_PROVIDER_STATUS_INVALID");
};

class HttpRenderingProvider implements RenderingProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;

  constructor(baseUrl: string, apiKey: string | undefined, timeoutMs: number) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  private headers(): HeadersInit {
    return {
      "content-type": "application/json",
      ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
    };
  }

  private async request(
    url: string,
    init: RequestInit,
  ): Promise<ProviderResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await readJson(
        await fetch(url, {
          ...init,
          headers: this.headers(),
          signal: controller.signal,
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("RENDERING_PROVIDER_TIMEOUT");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async submit(request: RenderRequest): Promise<RenderSubmission> {
    const body = await this.request(`${this.baseUrl}/renders`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    return { providerJobId: asJobId(body), provider: "http" };
  }

  async getStatus(providerJobId: string): Promise<RenderStatus> {
    const body = await this.request(
      `${this.baseUrl}/renders/${encodeURIComponent(providerJobId)}`,
      { method: "GET" },
    );
    return asStatus(body.status);
  }
}

class UnconfiguredRenderingProvider implements RenderingProvider {
  async submit(): Promise<RenderSubmission> {
    throw new Error("RENDERING_PROVIDER_NOT_CONFIGURED");
  }
  async getStatus(): Promise<RenderStatus> {
    throw new Error("RENDERING_PROVIDER_NOT_CONFIGURED");
  }
}

export function getRenderingProvider(): RenderingProvider {
  const provider = process.env.RENDERING_PROVIDER?.trim();
  if (!provider) return new UnconfiguredRenderingProvider();

  if (provider === "http") {
    const baseUrl = process.env.RENDERING_PROVIDER_URL?.trim();
    if (!baseUrl) throw new Error("RENDERING_PROVIDER_URL_REQUIRED");
    const timeoutMs = Number(
      process.env.RENDERING_PROVIDER_TIMEOUT_MS ?? 30000,
    );
    if (!Number.isFinite(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
      throw new Error("RENDERING_PROVIDER_TIMEOUT_MS_INVALID");
    }
    return new HttpRenderingProvider(
      baseUrl,
      process.env.RENDERING_PROVIDER_API_KEY?.trim() || undefined,
      timeoutMs,
    );
  }

  throw new Error(`RENDERING_PROVIDER_UNSUPPORTED:${provider}`);
}
