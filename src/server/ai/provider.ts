export type RenderRequest = {
  jobId: string;
  type: string;
  input: Record<string, unknown>;
};
export type RenderResult = {
  providerJobId: string;
  output: Record<string, unknown>;
};

export interface AIProvider {
  submit(request: RenderRequest): Promise<RenderResult>;
}

export function getAIProvider(): AIProvider {
  throw new Error("AI_PROVIDER_NOT_CONFIGURED");
}
