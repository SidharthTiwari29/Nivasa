import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createDesignRevision } from "@/server/services/designProjectService";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const bodySchema = z.object({
  baseVersionId: z.string().min(1),
  instruction: z.string().trim().min(1).max(2000),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

type RouteParams = { params: Promise<{ projectId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const { baseVersionId, instruction, parameters } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const revision = await createDesignRevision({
      ownerId: userId,
      projectId,
      baseVersionId,
      instruction,
      parameters,
    });
    return NextResponse.json({ revision }, { status: 201 });
  },
);
