import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { z } from "zod";
import { marketRankingService } from "@/server/marketIntelligence/marketService";

type RouteParams = { params: Promise<{ productId: string }> };

const querySchema = z.object({
  currentPriceMinor: z.coerce.number().int().nonnegative().optional(),
});

export const GET = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { productId } = await params;
    const url = new URL(request.url);
    const { currentPriceMinor } = parseOrThrow(querySchema, {
      currentPriceMinor: url.searchParams.get("currentPriceMinor") ?? undefined,
    });
    const substitutions = await marketRankingService.substitutionsFor(
      productId,
      currentPriceMinor !== undefined ? BigInt(currentPriceMinor) : null,
    );
    return NextResponse.json({ substitutions });
  },
);
