import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { designDirectionService } from "@/server/services/designDirectionService";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const bodySchema = z.object({ name: z.string().trim().min(1).max(200) });

type RouteParams = { params: Promise<{ projectId: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const directions = await designDirectionService.listDirections(
      projectId,
      userId,
    );
    return NextResponse.json({ directions });
  },
);

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const { name } = parseOrThrow(bodySchema, await request.json());
    const direction = await designDirectionService.createDirection(
      projectId,
      userId,
      name,
    );
    return NextResponse.json({ direction }, { status: 201 });
  },
);
