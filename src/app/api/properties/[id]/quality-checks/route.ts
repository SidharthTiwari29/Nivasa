import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { designQualityService } from "@/server/services/designQualityService";

const propertyIdParamSchema = z.object({ id: z.string().cuid() });

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const flags = await designQualityService.runChecks(id, userId);
    return NextResponse.json({ flags });
  },
);
