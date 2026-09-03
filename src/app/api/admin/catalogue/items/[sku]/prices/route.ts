import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { addCataloguePrice } from "@/server/services/catalogueService";

const paramsSchema = z.object({ sku: z.string().min(1) });
const bodySchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().trim().length(3).optional(),
});

type RouteParams = { params: Promise<{ sku: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    await requireAdmin();
    const { sku } = parseOrThrow(paramsSchema, await params);
    const { amountMinor, currency } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const price = await addCataloguePrice({
      sku,
      amountMinor: BigInt(amountMinor),
      currency,
    });
    return NextResponse.json({ price }, { status: 201 });
  },
);
