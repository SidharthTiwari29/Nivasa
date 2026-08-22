import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { z } from "zod";
import { createPurchase } from "@/server/payments/purchaseService";

const schema = z.object({ packageCode: z.string().min(1).max(64) });

export const POST = withErrorHandling(async (request: Request) => {
  const actor = await requireAuth();
  const input = parseOrThrow(schema, await request.json());
  const purchase = await createPurchase(actor.userId, input.packageCode);
  return NextResponse.json({ purchase: { id: purchase.id, packageCode: purchase.package.code, providerOrderId: purchase.providerOrderId, amountMinor: purchase.amountMinor.toString(), currency: purchase.currency } }, { status: 201 });
});
