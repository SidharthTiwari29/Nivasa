import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { marketRankingService } from "@/server/marketIntelligence/marketService";

type RouteParams = { params: Promise<{ category: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { category } = await params;
    const options = await marketRankingService.moreAndBetterOptions(category);
    return NextResponse.json({ options });
  },
);
