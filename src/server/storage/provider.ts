export type UploadGrant = { objectKey: string; uploadUrl: string; expiresAt: Date };
export interface StorageProvider { createUploadGrant(input: { objectKey: string; contentType: string; expiresInSeconds: number }): Promise<UploadGrant>; createDownloadUrl(objectKey: string, expiresInSeconds: number): Promise<string>; }
export function getStorageProvider(): StorageProvider { throw new Error("STORAGE_PROVIDER_NOT_CONFIGURED"); }
