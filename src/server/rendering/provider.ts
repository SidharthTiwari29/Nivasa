export type RenderOutputKind = 'image' | 'panorama' | 'scene_3d' | 'walkthrough' | 'video';

export type RenderRequest = {
  propertyId: string;
  floorPlanId: string;
  designVersionId: string;
  outputKind: RenderOutputKind;
  specification: unknown;
  actualApartmentReference?: { storageKey: string; checksum?: string };
  idempotencyKey: string;
};

export interface RenderProvider {
  readonly name: string;
  requestRender(request: RenderRequest): Promise<{ providerJobId: string }>;
  getRenderResult(providerJobId: string): Promise<{ storageKey: string; metadata?: Record<string, unknown> } | null>;
}
