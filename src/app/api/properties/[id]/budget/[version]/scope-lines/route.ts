import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { propertyIdParamSchema } from "@/server/validators/homeIntelligence";
import {
  addBudgetScopeLineSchema,
  budgetVersionParamsSchema,
} from "@/server/validators/budget";
import { budgetService } from "@/server/services/budgetService";

type RouteParams = {
  params: Promise<{ id: string; version: string }>;
};

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const routeParams = await params;
    const { id } = parseOrThrow(propertyIdParamSchema, { id: routeParams.id });
    const { version } = parseOrThrow(budgetVersionParamsSchema, {
      version: routeParams.version,
    });
    const input = parseOrThrow(addBudgetScopeLineSchema, await request.json());

    const result = await budgetService.addScopeLine(id, userId, version, input);
    return NextResponse.json({ result }, { status: 201 });
  },
);
