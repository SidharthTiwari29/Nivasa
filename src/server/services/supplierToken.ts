import { randomBytes, createHash, timingSafeEqual } from "crypto";

// A security credential, not a UX-friendly code like the referral system's
// 6-character code - 32 random bytes (256 bits) is far beyond brute-force
// range, hex-encoded for safe inclusion in a URL.
export function generateSupplierToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSupplierToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Constant-time comparison, even though the lookup already goes through a
// unique-indexed hash match at the database level - defense in depth
// against timing side-channels is cheap here and this is exactly the kind
// of credential-comparison code where that discipline matters, the same
// reasoning that applies to webhook signature verification elsewhere in
// this codebase.
export function verifySupplierToken(
  providedTokenHash: string,
  storedTokenHash: string,
): boolean {
  const a = Buffer.from(providedTokenHash);
  const b = Buffer.from(storedTokenHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
