export type AIRequest = {
  jobId: string;
  type: "ROOM_UNDERSTANDING" | "DESIGN_GENERATION" | "DESIGN_REVISION" | "BOQ_ASSISTANCE" | "WALKTHROUGH_PROMPT";
  input: Record<string, unknown>;
};

export type AIResult = {
  providerJobId: string;
  output: Record<string, unknown>;
};

export interface AIProvider {
  analyzeFloorPlan(request: AIRequest): Promise<AIResult>;
  generateDesign(request: AIRequest): Promise<AIResult>;
  reviseDesign(request: AIRequest): Promise<AIResult>;
  assistBoq(request: AIRequest): Promise<AIResult>;
  createWalkthroughPrompt(request: AIRequest): Promise<AIResult>;
}

class UnconfiguredAIProvider implements AIProvider {
  private fail(): never {
    throw new Error("AI_PROVIDER_NOT_CONFIGURED");
  }
  analyzeFloorPlan(): Promise<AIResult> { return Promise.reject(this.fail()); }
  generateDesign(): Promise<AIResult> { return Promise.reject(this.fail()); }
  reviseDesign(): Promise<AIResult> { return Promise.reject(this.fail()); }
  assistBoq(): Promise<AIResult> { return Promise.reject(this.fail()); }
  createWalkthroughPrompt(): Promise<AIResult> { return Promise.reject(this.fail()); }
}

export function getAIProvider(): AIProvider {
  if (!process.env.AI_PROVIDER) return new UnconfiguredAIProvider();
  throw new Error(`AI_PROVIDER_UNSUPPORTED:${process.env.AI_PROVIDER}`);
}
