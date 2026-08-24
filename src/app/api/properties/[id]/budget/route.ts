import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  createBudgetSchema,
  lockBudgetSchema,
  budgetImpactSchema,
} from "@/server/validators/budget";
import { budgetService } from "@/server/services/budgetService";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { userId } = await requireAuth();
    const { id } = await context.params;
    const budget = await budgetService.get(id, userId);
    return NextResponse.json({ budget });
  },
);

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { userId } = await requireAuth();
    const { id } = await context.params;
    const input = parseOrThrow(createBudgetSchema, await request.json());
    const version = await budgetService.create(id, userId, input);
    return NextResponse.json({ version }, { status: 201 });
  },
);

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { userId } = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();
    if (body.action === "lock") {
      const input = parseOrThrow(lockBudgetSchema, body);
      const result = await budgetService.lock(id, userId, input);
      return NextResponse.json({ result });
    }
    if (body.action === "impact") {
      const input = parseOrThrow(budgetImpactSchema, body);
      const result = await budgetService.impact(id, userId, input);
      return NextResponse.json({ result });
    }
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Unsupported budget action" } },
      { status: 422 },
    );
  },
);
