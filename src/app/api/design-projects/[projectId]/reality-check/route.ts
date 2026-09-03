import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { checkDesignReality } from "@/server/services/designRealityCheck";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const objectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  xMm: z.number(),
  yMm: z.number(),
  widthMm: z.number().positive(),
  depthMm: z.number().positive(),
});
const bodySchema = z.object({
  room: z.object({
    widthMm: z.number().positive(),
    depthMm: z.number().positive(),
  }),
  objects: z.array(objectSchema).max(200),
});

type RouteParams = { params: Promise<{ projectId: string }> };

// The real spatial feasibility gate this session's earlier architecture
// discussion called for: Niwasthan (not an AI image generator) owns the
// authoritative answer to "does this layout actually fit in the real
// room." Deliberately takes room dimensions and object placement
// directly in the request body rather than reading them from a stored
// DesignVersion - no structured per-version object-placement model
// exists yet, so this is honestly scoped as a standalone, real,
// immediately-usable check (by an admin, a future AI-generation
// pipeline, or manual testing) rather than pretending a deeper
// integration already exists.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const project = await prisma.designProject.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new NotFoundError("DesignProject");

    const { room, objects } = parseOrThrow(bodySchema, await request.json());
    const checks = checkDesignReality(room, objects);
    return NextResponse.json({ checks });
  },
);
