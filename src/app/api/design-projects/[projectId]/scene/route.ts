import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { generateSceneDescription } from "@/server/services/sceneDescriptionService";

const paramsSchema = z.object({ projectId: z.string().min(1) });

type RouteParams = { params: Promise<{ projectId: string }> };

// Real, structured scene data - real confirmed room geometry, real
// committed BOQ items - the foundation both a future browser-based
// "Walk Around" viewer and a future Blender/render-worker "Create 360
// Video" pipeline can consume from the exact same source, per the
// two-experiences-one-model architecture.
export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const scene = await generateSceneDescription(projectId, userId);
    return NextResponse.json({ scene });
  },
);
