import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createPropertySchema } from "@/server/validators/property";
import { propertyService } from "@/server/services/propertyService";

export const GET = withErrorHandling(async () => {
  const { userId } = await requireAuth();
  const properties = await propertyService.list(userId);
  return NextResponse.json({ properties });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const body = parseOrThrow(createPropertySchema, await request.json());
  const property = await propertyService.create(userId, body);
  return NextResponse.json({ property }, { status: 201 });
});
