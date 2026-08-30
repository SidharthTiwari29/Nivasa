import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { quoteIdParamSchema } from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = {
  params: Promise<{ procurementRequestId: string; quoteId: string }>;
};

const bodySchema = z.object({
  proposedAmountMinor: z.number().int().positive(),
});

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { procurementRequestId, quoteId } = parseOrThrow(
      quoteIdParamSchema,
      await params,
    );
    const { proposedAmountMinor } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const result = await procurementService.proposeNegotiation(
      procurementRequestId,
      quoteId,
      userId,
      BigInt(proposedAmountMinor),
    );
    return NextResponse.json(result);
  },
);
