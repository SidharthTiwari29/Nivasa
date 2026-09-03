import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { listDesignProjectsForProperty } from "@/server/services/designProjectService";

const paramsSchema = z.object({ id: z.string().min(1) });

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    const projects = await listDesignProjectsForProperty(id, userId);
    return NextResponse.json({ projects });
  },
);
