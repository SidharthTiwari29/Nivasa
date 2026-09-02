import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { niwasthanFindsService } from "@/server/services/niwasthanFindsService";

const paramsSchema = z.object({ boqLineId: z.string().min(1) });

type RouteParams = { params: Promise<{ boqLineId: string }> };

export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { boqLineId } = parseOrThrow(paramsSchema, await params);
    const find = await niwasthanFindsService.scanForBetterOption(
      boqLineId,
      userId,
    );
    return NextResponse.json({ find });
  },
);
