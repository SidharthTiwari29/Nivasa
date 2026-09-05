import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { featureAccessService } from "@/server/entitlements/featureAccessService";
import { generateHomeScene } from "@/server/services/homeSceneService";

const paramsSchema = z.object({ id: z.string().min(1) });

type RouteParams = { params: Promise<{ id: string }> };

// Real, plan-gated entry point for README Section 36's signature
// Immersive capability - exclusive to NIWASTHAN_IMMERSIVE, matching the
// explicit plan boundary. A customer on any other plan gets a clear,
// real 403 naming exactly which feature is missing, not a silent
// failure or a degraded, unlabeled version of the real thing.
export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    await featureAccessService.requireFeature(userId, "immersive_walkthrough");
    const { id } = parseOrThrow(paramsSchema, await params);
    const { scene, skipped } = await generateHomeScene(id, userId);
    return NextResponse.json({ scene, skipped });
  },
);
