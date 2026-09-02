import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { brandService } from "@/server/services/brandService";

const paramsSchema = z.object({ brandId: z.string().min(1) });
const curateBrandSchema = z.object({
  positioning: z.string().trim().max(2000).optional(),
  strengths: z.string().trim().max(2000).optional(),
  weaknesses: z.string().trim().max(2000).optional(),
});

type RouteParams = { params: Promise<{ brandId: string }> };

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const admin = await requireAdmin();
    const { brandId } = parseOrThrow(paramsSchema, await params);
    const input = parseOrThrow(curateBrandSchema, await request.json());
    const brand = await brandService.curateBrand(brandId, admin.id, input);
    return NextResponse.json({ brand });
  },
);
