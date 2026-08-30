import type { RenderRequest, RenderSubmission, RenderingProvider } from "./provider";

export type RenderPipelineResult = {
  provider: string;
  providerJobId: string;
};

export async function submitRender(
  provider: RenderingProvider,
  request: RenderRequest,
): Promise<RenderPipelineResult> {
  if (!request.jobId.trim()) throw new Error("RENDER_JOB_ID_REQUIRED");
  if (!request.type) throw new Error("RENDER_TYPE_REQUIRED");

  const submission: RenderSubmission = await provider.submit(request);
  if (!submission.provider.trim()) throw new Error("RENDER_PROVIDER_REQUIRED");
  if (!submission.providerJobId.trim()) throw new Error("PROVIDER_JOB_ID_REQUIRED");

  return submission;
}

export async function pollRender(
  provider: RenderingProvider,
  providerJobId: string,
): Promise<Awaited<ReturnType<RenderingProvider["getStatus"]>>> {
  if (!providerJobId.trim()) throw new Error("PROVIDER_JOB_ID_REQUIRED");
  return provider.getStatus(providerJobId);
}
