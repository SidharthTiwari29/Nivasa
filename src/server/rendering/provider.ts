export type RenderOutputKind = 'image' | 'panorama' | 'scene_3d' | 'walkthrough' | 'video';
export type RenderRequest = { designVersionId: string; outputKind: RenderOutputKind; specification: unknown; idempotencyKey: string };
export interface RenderProvider { readonly name: string; requestRender(request: RenderRequest): Promise<{ providerJobId: string }>; }
