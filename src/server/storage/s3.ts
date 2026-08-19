import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ObjectStorageProvider, SignedUrlRequest } from './objectStorage';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`NOT_CONFIGURED:${name}`);
  return value;
}

export class S3ObjectStorageProvider implements ObjectStorageProvider {
  readonly name = 's3';
  private readonly bucket = required('S3_BUCKET');
  private readonly client = new S3Client({
    region: required('S3_REGION'),
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: required('S3_ACCESS_KEY_ID'),
      secretAccessKey: required('S3_SECRET_ACCESS_KEY'),
    },
  });

  async createUploadUrl(request: SignedUrlRequest) {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: request.key, ContentType: request.contentType });
    return { url: await getSignedUrl(this.client, command, { expiresIn: request.expiresInSeconds }), key: request.key };
  }

  async createReadUrl(key: string, expiresInSeconds: number) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
