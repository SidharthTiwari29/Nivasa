import { getS3CompatibleStorageProvider } from "./s3Compatible";

export type UploadGrant = {
  objectKey: string;
  uploadUrl: string;
  expiresAt: Date;
};

export interface StorageProvider {
  createUploadGrant(input: {
    objectKey: string;
    contentType: string;
    expiresInSeconds: number;
  }): Promise<UploadGrant>;
  createDownloadUrl(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<string>;
}

export function getStorageProvider(): StorageProvider {
  return getS3CompatibleStorageProvider();
}
