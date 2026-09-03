import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { brandService } from "@/server/services/brandService";

const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(200),
  website: z.string().url().max(500).optional(),
});

export const POST = withErrorHandling(async (request: Request) => {
  await requireAdmin();
  const { name, website } = parseOrThrow(
    createBrandSchema,
    await request.json(),
  );
  const brand = await brandService.createBrand(name, website);
  return NextResponse.json({ brand }, { status: 201 });
});
