import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueVerificationService } from "@/server/services/catalogueVerificationService";

const paramsSchema = z.object({ itemId: z.string().min(1) });

type RouteParams = { params: Promise<{ itemId: string }> };

export const POST = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const admin = await requireAdmin();
    const { itemId } = parseOrThrow(paramsSchema, await params);
    const price = await catalogueVerificationService.verifyCurrentPrice(
      itemId,
      admin.id,
    );
    return NextResponse.json({ price });
  },
);
