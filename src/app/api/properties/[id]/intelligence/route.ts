import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  homeIntelligenceSchema,
  propertyIdParamSchema,
} from "@/server/validators/homeIntelligence";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const property = await homeIntelligenceService.get(id, userId);
    return NextResponse.json({ property });
  },
);

export const PUT = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const body = parseOrThrow(homeIntelligenceSchema, await request.json());
    const homeIntelligence = await homeIntelligenceService.upsert(
      id,
      userId,
      body,
    );
    return NextResponse.json({ homeIntelligence });
  },
);
