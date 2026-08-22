import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEnv } from "@/server/config/env";
import { S3CompatibleStorageProvider } from "./s3Compatible";

vi.mock("@/server/config/env", () => ({
  getEnv: vi.fn(),
}));

const mockedGetEnv = vi.mocked(getEnv);

beforeEach(() => {
  mockedGetEnv.mockReturnValue({
    DATABASE_URL: "postgresql://localhost/nivasa",
    AUTH_SECRET: "a".repeat(32),
    STORAGE_BUCKET: "nivasa",
    STORAGE_REGION: "auto",
    STORAGE_ENDPOINT: "https://example.r2.cloudflarestorage.com",
    STORAGE_ACCESS_KEY_ID: "access-key",
    STORAGE_SECRET_ACCESS_KEY: "secret-key",
  } as ReturnType<typeof getEnv>);
});

describe("S3-compatible storage provider", () => {
  it("creates a bounded signed upload URL with the content type signed", async () => {
    const provider = new S3CompatibleStorageProvider();
    const grant = await provider.createUploadGrant({
      objectKey: "users/user-a/properties/property-1/assets/asset-1",
      contentType: "image/jpeg",
      expiresInSeconds: 3600,
    });

    const url = new URL(grant.uploadUrl);
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe(
      "/nivasa/users/user-a/properties/property-1/assets/asset-1",
    );
    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("900");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("content-type;host");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
    expect(grant.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("creates a signed download URL", async () => {
    const provider = new S3CompatibleStorageProvider();
    const url = new URL(
      await provider.createDownloadUrl(
        "users/user-a/properties/property-1/assets/asset-1",
        600,
      ),
    );

    expect(url.pathname).toContain("/nivasa/users/user-a/properties/property-1/assets/asset-1");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("host");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
  });
});
