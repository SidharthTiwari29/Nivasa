import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  executionIdParamSchema,
  updateExecutionStatusSchema,
} from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";

type RouteParams = { params: Promise<{ executionId: string }> };

export const PATCH = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { executionId } = parseOrThrow(executionIdParamSchema, await params);
    const { status, snagNotes } = parseOrThrow(
      updateExecutionStatusSchema,
      await request.json(),
    );
    const execution = await procurementService.updateExecutionStatus(
      executionId,
      userId,
      status,
      snagNotes,
    );
    return NextResponse.json({ execution });
  },
);
