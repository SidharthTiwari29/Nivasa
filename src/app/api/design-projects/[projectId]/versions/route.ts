import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createDesignVersion } from "@/server/services/designProjectService";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const bodySchema = z.object({
  // Optional - when omitted, the service defaults to the project's real
  // currently ACTIVE direction, which is the correct behavior for "just
  // generate the next version of what I'm working on right now."
  directionId: z.string().min(1).optional(),
  prompt: z.string().trim().max(5000).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

type RouteParams = { params: Promise<{ projectId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const { directionId, prompt, parameters } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const version = await createDesignVersion({
      ownerId: userId,
      projectId,
      directionId,
      prompt,
      parameters,
    });
    return NextResponse.json({ version }, { status: 201 });
  },
);
