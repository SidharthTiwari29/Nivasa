import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError } from "@/server/errors/AppError";
import { getCatalogueItem } from "@/server/services/catalogueService";

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
    return NextResponse.json({ item });
  },
);
