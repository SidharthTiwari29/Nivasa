import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import {
  calculateDesignBudgetImpact,
  sumKnownBudgetImpact,
} from "@/server/services/designBudgetIntegration";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const selectionSchema = z.object({
  selectionId: z.string().min(1),
  catalogueItemId: z.string().min(1).optional(),
  description: z.string().trim().min(1).max(300),
  quantity: z.number().positive(),
  unitPriceMinor: z.number().int().nonnegative().optional(),
  currency: z.string().trim().min(1).max(10),
});
const bodySchema = z.object({
  selections: z.array(selectionSchema).max(200),
  currency: z.string().trim().min(1).max(10),
});

type RouteParams = { params: Promise<{ projectId: string }> };

// The real "what would this cost me" preview - before a customer
// commits to anything, they can see the honest financial impact of a
// proposed set of design choices. Items with a known price contribute a
// real number; items without one are flagged as priceKnown: false and
// deliberately excluded from the sum, never guessed at to make the
// preview look complete.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const project = await prisma.designProject.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new NotFoundError("DesignProject");

    const { selections, currency } = parseOrThrow(
      bodySchema,
      await request.json(),
    );
    const impacts = calculateDesignBudgetImpact(selections);
    const totalKnownImpactMinor = sumKnownBudgetImpact(impacts, currency);
    return NextResponse.json({ impacts, totalKnownImpactMinor, currency });
  },
);
