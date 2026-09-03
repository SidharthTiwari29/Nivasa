import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueBargainService } from "@/server/services/catalogueBargainService";

const paramsSchema = z.object({ boqLineId: z.string().min(1) });
const bodySchema = z.object({
  proposedPriceMinor: z.number().int().positive(),
});

type RouteParams = { params: Promise<{ boqLineId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { boqLineId } = parseOrThrow(paramsSchema, await params);
    const { proposedPriceMinor } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const outcome = await catalogueBargainService.proposePrice(
      boqLineId,
      userId,
      BigInt(proposedPriceMinor),
    );
    return NextResponse.json({ outcome });
  },
);
