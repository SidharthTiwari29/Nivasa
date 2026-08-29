import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { propertyIdParamSchema } from "@/server/validators/homeIntelligence";
import { budgetScopeLineParamsSchema } from "@/server/validators/budget";
import { budgetService } from "@/server/services/budgetService";

type RouteParams = {
  params: Promise<{ id: string; version: string; scopeLineId: string }>;
};

export const DELETE = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const routeParams = await params;
    const { id } = parseOrThrow(propertyIdParamSchema, { id: routeParams.id });
    const { version, scopeLineId } = parseOrThrow(budgetScopeLineParamsSchema, {
      version: routeParams.version,
      scopeLineId: routeParams.scopeLineId,
    });

    const result = await budgetService.removeScopeLine(
      id,
      userId,
      version,
      scopeLineId,
    );
    return NextResponse.json({ result });
  },
);
