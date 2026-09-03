import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError } from "@/server/errors/AppError";
import { getCatalogueItem } from "@/server/services/catalogueService";
import { deriveMeritsAndDemerits } from "@/server/services/productMerits";

const paramsSchema = z.object({ sku: z.string().min(1) });

type RouteParams = { params: Promise<{ sku: string }> };

// Read access is intentionally open to any authenticated user, not
// admin-only - browsing the real catalogue (what a customer's curated
// design draws from) is a normal customer action; only creating/editing
// items and prices requires admin authority.
export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { sku } = parseOrThrow(paramsSchema, await params);
    const item = await getCatalogueItem(sku);
    if (!item) throw new NotFoundError("CatalogueItem");

    const price = item.prices[0];
    // The real "not just manufacturer marketing" pros/cons layer -
    // computed here, at the exact point a customer actually views a
    // product, from real data already fetched for this response. Every
    // input is genuine: real warranty/MRP/verification/availability
    // fields already confirmed structured earlier this session, plus
    // the real category-peer count computed alongside the item itself.
    const merits = price
      ? deriveMeritsAndDemerits({
          warrantyMonths: price.warrantyMonths,
          mrpMinor: price.mrpMinor,
          unitPriceMinor: price.amountMinor,
          priceAgeDays: Math.floor(
            (Date.now() - price.effectiveFrom.getTime()) / 86_400_000,
          ),
          verifiedAt: price.verifiedAt,
          availability: price.availability,
          alternativesConsidered: item.alternativesConsidered,
        })
      : null;

    return NextResponse.json({ item, merits });
  },
);
