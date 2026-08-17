export type AICapability = 'vision_analysis' | 'design_specification' | 'image_generation' | 'rendering' | 'scene_3d' | 'video';
export type AIJobInput = { projectId: string; capability: AICapability; payload: unknown; idempotencyKey: string };
export type AIJobResult = { provider: string; model: string; output: unknown; usage: { inputTokens?: number; outputTokens?: number; costMinor?: number; currency?: string } };

export interface AIProvider {
  readonly name: string;
  supports(capability: AICapability): boolean;
  enqueue(input: AIJobInput): Promise<{ providerJobId: string }>;
  getResult(providerJobId: string): Promise<AIJobResult | null>;
}
