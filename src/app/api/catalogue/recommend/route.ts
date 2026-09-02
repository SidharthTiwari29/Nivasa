import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueCurationService } from "@/server/services/catalogueCurationService";

const bodySchema = z.object({
  projectId: z.string().min(1),
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
  const { userId } = await requireAuth();
  const { projectId, needs, targetBudgetMinor } = parseOrThrow(
    bodySchema,
    await request.json(),
  );
  const recommendation = await catalogueCurationService.recommend(
    projectId,
    userId,
    needs,
    BigInt(targetBudgetMinor),
  );
  return NextResponse.json({ recommendation }, { status: 201 });
});
