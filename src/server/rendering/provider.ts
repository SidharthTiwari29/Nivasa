export type RenderType = "DESIGN_IMAGE" | "PANORAMA" | "THREE_D_SCENE" | "WALKTHROUGH" | "VIDEO" | "BEFORE_AFTER";

export type RenderRequest = {
  jobId: string;
  type: RenderType;
  input: Record<string, unknown>;
};

export type RenderSubmission = {
  providerJobId: string;
  provider: string;
};

export interface RenderingProvider {
  submit(request: RenderRequest): Promise<RenderSubmission>;
  getStatus(providerJobId: string): Promise<"QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED">;
}

class UnconfiguredRenderingProvider implements RenderingProvider {
  async submit(): Promise<RenderSubmission> { throw new Error("RENDERING_PROVIDER_NOT_CONFIGURED"); }
  async getStatus(): Promise<"QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"> { throw new Error("RENDERING_PROVIDER_NOT_CONFIGURED"); }
}

export function getRenderingProvider(): RenderingProvider {
  if (!process.env.RENDERING_PROVIDER) return new UnconfiguredRenderingProvider();
  throw new Error(`RENDERING_PROVIDER_UNSUPPORTED:${process.env.RENDERING_PROVIDER}`);
}
