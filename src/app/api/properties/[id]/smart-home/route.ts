import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { propertyIdParamSchema } from "@/server/validators/homeIntelligence";
import {
  smartHomePatchSchema,
  smartHomePlanSchema,
} from "@/server/validators/smartHome";
import { smartHomeService } from "@/server/services/smartHomeService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const result = await smartHomeService.get(id, userId);
    return NextResponse.json({ result });
  },
);

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const input = parseOrThrow(smartHomePlanSchema, await request.json());
    const result = await smartHomeService.create(id, userId, input);
    return NextResponse.json({ result }, { status: 201 });
  },
);

export const PATCH = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const input = parseOrThrow(smartHomePatchSchema, await request.json());
    const result = await smartHomeService.patch(id, userId, input);
    return NextResponse.json({ result }, { status: 201 });
  },
);
