import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = { params: Promise<{ orderId: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { orderId } = parseOrThrow(orderIdParamSchema, await params);
    const { status } = parseOrThrow(
      updateOrderStatusSchema,
      await request.json(),
    );
    const order = await procurementService.updateOrderStatus(
      orderId,
      userId,
      status,
    );
    return NextResponse.json({ order });
  },
);
