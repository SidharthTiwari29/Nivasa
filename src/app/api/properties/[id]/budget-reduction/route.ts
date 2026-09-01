import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { budgetReductionService } from "@/server/services/budgetReductionService";

const paramsSchema = z.object({ id: z.string() });
const querySchema = z.object({
  targetReductionMinor: z.coerce.number().int().nonnegative(),
});

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(paramsSchema, await params);
    const url = new URL(request.url);
    const { targetReductionMinor } = parseOrThrow(querySchema, {
      targetReductionMinor: url.searchParams.get("targetReductionMinor"),
    });
    const plan = await budgetReductionService.suggestReduction(
      id,
      userId,
      BigInt(targetReductionMinor),
    );
    return NextResponse.json(plan);
  },
);
