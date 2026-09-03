import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { niwasthanMagicService } from "@/server/services/niwasthanMagicService";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const querySchema = z.object({
  upgradeBudgetMinor: z.coerce.number().int().nonnegative(),
});

type RouteParams = { params: Promise<{ projectId: string }> };

export const GET = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const url = new URL(request.url);
    const { upgradeBudgetMinor } = parseOrThrow(querySchema, {
      upgradeBudgetMinor: url.searchParams.get("upgradeBudgetMinor"),
    });
    const suggestions = await niwasthanMagicService.suggestSmartUpgrades(
      projectId,
      userId,
      BigInt(upgradeBudgetMinor),
    );
    return NextResponse.json(suggestions);
  },
);
