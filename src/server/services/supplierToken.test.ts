import { describe, expect, it } from "vitest";
import {
  generateSupplierToken,
  hashSupplierToken,
  verifySupplierToken,
} from "./supplierToken";

describe("generateSupplierToken", () => {
  it("generates a 64-character hex string (256 bits of entropy)", () => {
    const token = generateSupplierToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates a different token on every call", () => {
    const a = generateSupplierToken();
    const b = generateSupplierToken();
    expect(a).not.toBe(b);
  });
});

describe("hashSupplierToken", () => {
  it("is deterministic - the same token always hashes to the same value", () => {
    const token = "test-token-value";
    expect(hashSupplierToken(token)).toBe(hashSupplierToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashSupplierToken("token-a")).not.toBe(hashSupplierToken("token-b"));
  });

  it("produces a 64-character hex SHA-256 digest", () => {
    const hash = hashSupplierToken("anything");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifySupplierToken", () => {
  it("returns true for matching hashes", () => {
    const hash = hashSupplierToken("real-token");
    expect(verifySupplierToken(hash, hash)).toBe(true);
  });

  it("returns false for non-matching hashes", () => {
    const hashA = hashSupplierToken("token-a");
    const hashB = hashSupplierToken("token-b");
    expect(verifySupplierToken(hashA, hashB)).toBe(false);
  });

  it("returns false rather than throwing for hashes of different lengths", () => {
    expect(verifySupplierToken("short", hashSupplierToken("token"))).toBe(
      false,
    );
  });
});
