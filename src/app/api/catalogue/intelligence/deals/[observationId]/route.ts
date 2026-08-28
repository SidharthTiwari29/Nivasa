import { NextResponse } from "next/server";
import { dealIntelligenceService } from "@/server/services/dealIntelligenceService";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  dealQuerySchema,
  observationIdParamSchema,
} from "@/server/validators/marketIntelligence";
import { requireAuth } from "@/server/middleware/requireAuth";

type RouteParams = { params: Promise<{ observationId: string }> };

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
    const { observationId } = parseOrThrow(
      observationIdParamSchema,
      await params,
    );
    const url = new URL(request.url);
    const query = parseOrThrow(
      dealQuerySchema,
      Object.fromEntries(url.searchParams.entries()),
    );
    const result = await dealIntelligenceService.findForObservation({
      observationId,
      geography: query.geography,
      minimumSavingBps: query.minimumSavingBps,
    });
    return NextResponse.json(serialize(result));
  },
);
