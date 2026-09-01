import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { supplierInviteService } from "@/server/services/supplierInviteService";

const paramsSchema = z.object({ procurementRequestId: z.string() });
const bodySchema = z.object({
  supplierName: z.string().trim().min(1).max(200),
});

type RouteParams = { params: Promise<{ procurementRequestId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { procurementRequestId } = parseOrThrow(paramsSchema, await params);
    const { supplierName } = parseOrThrow(bodySchema, await request.json());
    const invite = await supplierInviteService.createInvite(
      procurementRequestId,
      userId,
      supplierName,
    );
    return NextResponse.json({ invite }, { status: 201 });
  },
);
