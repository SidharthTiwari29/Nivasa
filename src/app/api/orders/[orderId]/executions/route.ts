import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  orderIdParamSchema,
  scheduleExecutionSchema,
} from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = { params: Promise<{ orderId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { orderId } = parseOrThrow(orderIdParamSchema, await params);
    const { scheduledDate } = parseOrThrow(
      scheduleExecutionSchema,
      await request.json(),
    );
    const execution = await procurementService.scheduleExecution(
      orderId,
      userId,
      scheduledDate,
    );
    return NextResponse.json({ execution }, { status: 201 });
  },
);
