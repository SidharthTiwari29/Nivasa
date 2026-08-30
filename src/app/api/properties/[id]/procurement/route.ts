import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  createProcurementRequestSchema,
  propertyIdParamSchema,
} from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const body = parseOrThrow(
      createProcurementRequestSchema,
      await request.json(),
    );
    const procurementRequest = await procurementService.create(
      id,
      userId,
      body,
    );
    return NextResponse.json({ procurementRequest }, { status: 201 });
  },
);
