import { NextResponse } from "next/server";
import { withErrorHandling } from "@/server/errors/handler";
import { requireAuth } from "@/server/middleware/requireAuth";
import { parseOrThrow } from "@/server/validators/parse";
import {
  substitutionQuerySchema,
  variantIdParamSchema,
} from "@/server/validators/marketIntelligence";
import { substitutionIntelligenceService } from "@/server/services/substitutionIntelligenceService";

type RouteParams = { params: Promise<{ variantId: string }> };

function serialize(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serialize(item)]),
    );
  }
  return value;
}

export const GET = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { variantId } = parseOrThrow(variantIdParamSchema, await params);
    const url = new URL(request.url);
    const query = parseOrThrow(
      substitutionQuerySchema,
      Object.fromEntries(url.searchParams.entries()),
    );
    const result = await substitutionIntelligenceService.findForVariant({
      variantId,
      observationId: query.observationId,
      geography: query.geography,
    });
    return NextResponse.json(serialize(result));
  },
);
