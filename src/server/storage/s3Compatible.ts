import { createHash, createHmac } from "node:crypto";
import { getEnv } from "@/server/config/env";
import type { StorageProvider, UploadGrant } from "./provider";

const MAX_EXPIRES_SECONDS = 900;
const SERVICE = "s3";

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function canonicalPath(
  endpoint: URL,
  bucket: string,
  objectKey: string,
): string {
  const prefix = endpoint.pathname.replace(/\/$/, "");
  return `${prefix}/${encode(bucket)}/${objectKey
    .split("/")
    .map(encode)
    .join("/")}`;
}

function canonicalQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join("&");
}

function canonicalHeaderValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function signingKey(secret: string, date: string, region: string): Buffer {
  const dateKey = hmac(`AWS4${secret}`, date);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, SERVICE);
  return hmac(serviceKey, "aws4_request");
}

function presign(
  method: "GET" | "PUT",
  endpoint: URL,
  bucket: string,
  objectKey: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  expiresInSeconds: number,
  contentType?: string,
): string {
  const expires = Math.min(
    Math.max(Math.floor(expiresInSeconds), 1),
    MAX_EXPIRES_SECONDS,
  );
  const now = new Date();
  const amzDate = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const shortDate = amzDate.slice(0, 8);
  const host = endpoint.host;
  const signedHeaders = contentType ? "content-type;host" : "host";
  const credential =
    `${accessKeyId}/${shortDate}/${region}/${SERVICE}/aws4_request`;
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const headers = contentType
    ? `content-type:${canonicalHeaderValue(contentType)}\nhost:${host}\n`
    : `host:${host}\n`;
  const canonicalRequest = [
    method,
    canonicalPath(endpoint, bucket, objectKey),
    canonicalQuery(query),
    headers,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const scope = `${shortDate}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join("\n");
  const signature = createHmac(
    "sha256",
    signingKey(secretAccessKey, shortDate, region),
  )
    .update(stringToSign)
    .digest("hex");

  const url = new URL(endpoint.toString());
  url.pathname = canonicalPath(endpoint, bucket, objectKey);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("X-Amz-Signature", signature);
  return url.toString();
}

export class S3CompatibleStorageProvider implements StorageProvider {
  private readonly endpoint: URL;
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor() {
    const env = getEnv();
    if (
      !env.STORAGE_BUCKET ||
      !env.STORAGE_REGION ||
      !env.STORAGE_ENDPOINT ||
      !env.STORAGE_ACCESS_KEY_ID ||
      !env.STORAGE_SECRET_ACCESS_KEY
    ) {
      throw new Error("STORAGE_NOT_CONFIGURED");
    }

    this.endpoint = new URL(env.STORAGE_ENDPOINT);
    this.bucket = env.STORAGE_BUCKET;
    this.region = env.STORAGE_REGION;
    this.accessKeyId = env.STORAGE_ACCESS_KEY_ID;
    this.secretAccessKey = env.STORAGE_SECRET_ACCESS_KEY;
  }

  async createUploadGrant(input: {
    objectKey: string;
    contentType: string;
    expiresInSeconds: number;
  }): Promise<UploadGrant> {
    const uploadUrl = presign(
      "PUT",
      this.endpoint,
      this.bucket,
      input.objectKey,
      this.accessKeyId,
      this.secretAccessKey,
      this.region,
      input.expiresInSeconds,
      input.contentType,
    );
    return {
      objectKey: input.objectKey,
      uploadUrl,
      expiresAt: new Date(
        Date.now() +
          Math.min(input.expiresInSeconds, MAX_EXPIRES_SECONDS) * 1000,
      ),
    };
  }

  async createDownloadUrl(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<string> {
    return presign(
      "GET",
      this.endpoint,
      this.bucket,
      objectKey,
      this.accessKeyId,
      this.secretAccessKey,
      this.region,
      expiresInSeconds,
    );
  }
}

let provider: StorageProvider | undefined;

export function getS3CompatibleStorageProvider(): StorageProvider {
  return (provider ??= new S3CompatibleStorageProvider());
}
