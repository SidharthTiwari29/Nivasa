export type AICapability =
  | 'vision_analysis'
  | 'floor_plan_analysis'
  | 'room_detection'
  | 'measurement_extraction'
  | 'style_extraction'
  | 'design_specification'
  | 'image_generation'
  | 'boq_assistance'
  | 'walkthrough_generation'
  | 'video_generation';

export type AIJobInput = {
  propertyId?: string;
  floorPlanId?: string;
  projectId: string;
  capability: AICapability;
  payload: unknown;
  idempotencyKey: string;
};

export type AIJobResult = {
  provider: string;
  model: string;
  output: unknown;
  usage: { inputTokens?: number; outputTokens?: number; costMinor?: number; currency?: string };
};

export interface AIProvider {
  readonly name: string;
  supports(capability: AICapability): boolean;
  enqueue(input: AIJobInput): Promise<{ providerJobId: string }>;
  getResult(providerJobId: string): Promise<AIJobResult | null>;
}
