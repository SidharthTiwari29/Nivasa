import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import {
  listCatalogue,
  upsertCatalogueItem,
} from "@/server/services/catalogueService";

const querySchema = z.object({
  category: z.string().trim().min(1).optional(),
});
const upsertSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(30),
  active: z.boolean().optional(),
});

// Read access open to any authenticated user (browsing the catalogue is
// a normal customer action); creating/editing an item requires admin
// authority (see POST below).
export const GET = withErrorHandling(async (request: Request) => {
  await requireAuth();
  const url = new URL(request.url);
  const { category } = parseOrThrow(querySchema, {
    category: url.searchParams.get("category") ?? undefined,
  });
  const items = await listCatalogue(category);
  return NextResponse.json({ items });
});

export const POST = withErrorHandling(async (request: Request) => {
  await requireAdmin();
  const input = parseOrThrow(upsertSchema, await request.json());
  const item = await upsertCatalogueItem(input);
  return NextResponse.json({ item }, { status: 201 });
});
