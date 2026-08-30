import { NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { consumeRateLimit } from "@/server/security/rateLimit";
import { supplierInviteService } from "@/server/services/supplierInviteService";

const paramsSchema = z.object({ token: z.string().min(1) });
const bodySchema = z.object({
  totalAmountMinor: z.number().int().positive(),
  notes: z.string().trim().max(2000).optional(),
});

type RouteParams = { params: Promise<{ token: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { token } = parseOrThrow(paramsSchema, await params);
    const rateLimit = await consumeRateLimit({
      key: `supplier-portal:${token}`,
      limit: 10,
      windowSeconds: 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 },
      );
    }
    const { totalAmountMinor, notes } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const quote = await supplierInviteService.submitQuoteViaInvite(
      token,
      BigInt(totalAmountMinor),
      notes,
    );
    return NextResponse.json({ quote }, { status: 201 });
  },
);
