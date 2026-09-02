import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueCurationService } from "@/server/services/catalogueCurationService";

const bodySchema = z.object({
  needs: z
    .array(
      z.object({
        category: z.string().trim().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(50),
  targetBudgetMinor: z.number().int().positive(),
});

export const POST = withErrorHandling(async (request: Request) => {
  await requireAuth();
  const { needs, targetBudgetMinor } = parseOrThrow(
    bodySchema,
    await request.json(),
  );
  const result = await catalogueCurationService.curate(
    needs,
    BigInt(targetBudgetMinor),
  );
  return NextResponse.json(result);
});
