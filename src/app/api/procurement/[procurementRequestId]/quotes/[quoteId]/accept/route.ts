import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { quoteIdParamSchema } from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = {
  params: Promise<{ procurementRequestId: string; quoteId: string }>;
};

export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { procurementRequestId, quoteId } = parseOrThrow(
      quoteIdParamSchema,
      await params,
    );
    const order = await procurementService.acceptQuote(
      procurementRequestId,
      quoteId,
      userId,
    );
    return NextResponse.json({ order }, { status: 201 });
  },
);
