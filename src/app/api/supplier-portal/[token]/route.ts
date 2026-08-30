import { NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { consumeRateLimit } from "@/server/security/rateLimit";
import { supplierInviteService } from "@/server/services/supplierInviteService";

const paramsSchema = z.object({ token: z.string().min(1) });

type RouteParams = { params: Promise<{ token: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { token } = parseOrThrow(paramsSchema, await params);
    // Rate limited by the token value itself, not a user id - this route
    // has no authenticated caller identity, so the token is the only
    // stable key available to throttle repeated guessing attempts against.
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
    const context = await supplierInviteService.getInviteContext(token);
    return NextResponse.json({ context });
  },
);
