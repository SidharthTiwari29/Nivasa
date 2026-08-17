export type ObjectPurpose = 'floor_plan_upload' | 'design_asset' | 'render_asset' | 'invoice';
export type SignedUrlRequest = { key: string; contentType?: string; purpose: ObjectPurpose; expiresInSeconds: number };
export type StoredObject = { key: string; bucket: string; contentType: string; byteSize: number; checksum?: string };

export interface ObjectStorageProvider {
  createUploadUrl(request: SignedUrlRequest): Promise<{ url: string; fields?: Record<string, string>; key: string }>;
  createReadUrl(key: string, expiresInSeconds: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
