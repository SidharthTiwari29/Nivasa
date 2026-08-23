import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { homeDnaSchema, propertyIdParamSchema } from "@/server/validators/homeIntelligence";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const versions = await homeIntelligenceService.listHomeDna(id, userId);
    return NextResponse.json({ versions });
  },
);

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const body = parseOrThrow(homeDnaSchema, await request.json());
    const version = await homeIntelligenceService.createHomeDna(id, userId, body);
    return NextResponse.json({ version }, { status: 201 });
  },
);
