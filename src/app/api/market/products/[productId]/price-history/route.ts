import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { marketService } from "@/server/marketIntelligence/marketService";

type RouteParams = { params: Promise<{ productId: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { productId } = await params;
    const history = await marketService.priceHistory(productId);
    return NextResponse.json({ history });
  },
);
