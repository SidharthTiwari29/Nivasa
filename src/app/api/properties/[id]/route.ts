import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { propertyIdParamSchema, updatePropertySchema } from "@/server/validators/property";
import { propertyService } from "@/server/services/propertyService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(propertyIdParamSchema, await params);
  const property = await propertyService.get(id, userId);
  return NextResponse.json({ property });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(propertyIdParamSchema, await params);
  const body = parseOrThrow(updatePropertySchema, await request.json());
  const property = await propertyService.update(id, userId, body);
  return NextResponse.json({ property });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(propertyIdParamSchema, await params);
  await propertyService.remove(id, userId);
  return new NextResponse(null, { status: 204 });
});
