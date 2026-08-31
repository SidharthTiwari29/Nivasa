import { assetRepository } from "@/server/repositories/assetRepository";
import { computeRenderCacheKey } from "@/server/rendering/renderCache";
import {
  decideQualityTier,
  type QualityTier,
} from "@/server/rendering/qualityTier";

export type RenderCacheResult =
  | { hit: true; assetId: string }
  | { hit: false; cacheKey: string; qualityTier: QualityTier };

// The actual entry point for cost control: called before any real
// provider API call is made. A cache hit means zero API cost, full stop -
// the caller never touches the paid or free-tier provider at all for a
// request that's already been rendered. A cache miss returns both the key
// to store the new result under AND the quality tier decision, so the
// caller knows which provider/model to actually call.
export async function checkRenderCache(input: {
  designVersionId: string;
  renderType: string;
  roomConfirmedHighConfidence: boolean;
  planIncludesPriorityVisualization: boolean;
}): Promise<RenderCacheResult> {
  const qualityTier = decideQualityTier({
    roomConfirmedHighConfidence: input.roomConfirmedHighConfidence,
    planIncludesPriorityVisualization: input.planIncludesPriorityVisualization,
  });

  const cacheKey = computeRenderCacheKey({
    designVersionId: input.designVersionId,
    renderType: input.renderType,
    qualityTier,
  });

  const existing = await assetRepository.findByChecksum(cacheKey);
  if (existing) {
    return { hit: true, assetId: existing.id };
  }

  return { hit: false, cacheKey, qualityTier };
}
