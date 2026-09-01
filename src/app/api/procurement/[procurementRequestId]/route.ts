import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { procurementRequestIdParamSchema } from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = { params: Promise<{ procurementRequestId: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { procurementRequestId } = parseOrThrow(
      procurementRequestIdParamSchema,
      await params,
    );
    const procurementRequest = await procurementService.get(
      procurementRequestId,
      userId,
    );
    return NextResponse.json({ procurementRequest });
  },
);
