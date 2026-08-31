import { createHash } from "crypto";

// The single biggest cost-control lever available: an identical render
// request (same room, same design version, same render type, same
// quality tier) should never be paid for twice. This produces a stable
// key from exactly the inputs that determine the OUTPUT, deliberately
// excluding anything that varies per-request but doesn't change the
// result (timestamps, job ids) - two calls with the same design content
// must produce the same key, so the second one hits cache instead of
// calling a paid API again.
export function computeRenderCacheKey(input: {
  designVersionId: string;
  renderType: string;
  qualityTier: "STANDARD" | "HD";
}): string {
  const canonical = JSON.stringify({
    designVersionId: input.designVersionId,
    renderType: input.renderType,
    qualityTier: input.qualityTier,
  });
  return createHash("sha256").update(canonical).digest("hex");
}
