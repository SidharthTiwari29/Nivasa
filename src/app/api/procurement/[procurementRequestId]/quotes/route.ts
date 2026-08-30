import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  procurementRequestIdParamSchema,
  submitQuoteSchema,
} from "@/server/validators/procurement";
import { procurementService } from "@/server/services/procurementService";
import { consumeRateLimit } from "@/server/security/rateLimit";
import { ForbiddenError } from "@/server/errors/AppError";

type RouteParams = { params: Promise<{ procurementRequestId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { procurementRequestId } = parseOrThrow(
      procurementRequestIdParamSchema,
      await params,
    );

    // Quote submission was previously unprotected against spam: a
    // compromised session could flood a procurement request with junk
    // quotes. 20 submissions per 10 minutes per caller is generous for a
    // real supplier but stops abuse - matches the pattern already
    // established on the payment routes.
    try {
      await consumeRateLimit({
        key: `quote-submit:${userId}`,
        limit: 20,
        windowSeconds: 600,
      });
    } catch {
      throw new ForbiddenError("Too many quote submissions, please slow down");
    }

    const body = parseOrThrow(submitQuoteSchema, await request.json());
    const quote = await procurementService.submitQuote(
      procurementRequestId,
      userId,
      body,
    );
    return NextResponse.json({ quote }, { status: 201 });
  },
);
