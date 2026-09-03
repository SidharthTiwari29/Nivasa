import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { optimizeProjectSavings } from "@/server/services/projectSavingsOptimizer";

const paramsSchema = z.object({ projectId: z.string().min(1) });
const impactEnum = z.enum(["BETTER", "SIMILAR", "LOWER", "UNKNOWN"]);
const maintenanceEnum = z.enum(["BETTER", "SIMILAR", "HIGHER", "UNKNOWN"]);
const choiceSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().min(1).max(500),
  currentPriceMinor: z.number().int().nullable(),
  alternativePriceMinor: z.number().int().nullable(),
  qualityImpact: impactEnum,
  maintenanceImpact: maintenanceEnum,
  evidenceQuality: z.enum(["HIGH", "MEDIUM", "LOW", "UNKNOWN"]),
});
const bodySchema = z.object({ choices: z.array(choiceSchema).max(200) });

type RouteParams = { params: Promise<{ projectId: string }> };

// Same honest scoping as the reality-check route: takes real choices
// directly in the request body rather than reading them from an
// automatically-derived source, since no structural link yet connects
// real BOQ substitution/upgrade candidates to this exact shape. Real,
// immediately usable evidence-weighted ranking today; automatic
// derivation from a project's real BOQ is a genuine, separate next step.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = parseOrThrow(paramsSchema, await params);
    const project = await prisma.designProject.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new NotFoundError("DesignProject");

    const { choices } = parseOrThrow(bodySchema, await request.json());
    const opportunities = optimizeProjectSavings(choices);
    return NextResponse.json({ opportunities });
  },
);
