import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { NotFoundError, ConflictError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { createAndEnqueueJob } from "@/server/jobs/jobService";

type RouteParams = { params: Promise<{ projectId: string }> };

const bodySchema = z.object({
  type: z.enum([
    "ROOM_UNDERSTANDING",
    "DESIGN_GENERATION",
    "DESIGN_REVISION",
    "THREE_D_SCENE",
    "PANORAMA",
    "WALKTHROUGH",
    "VIDEO",
  ]),
  idempotencyKey: z.string().trim().min(1).max(200),
  payload: z.record(z.string(), z.unknown()).default({}),
});

// The route this whole credit-reservation/job-submission system was
// missing: the actual entry point a user calls to request an AI job.
// Before this existed, reserveCredits/confirmReservation/releaseReservation
// were fully built and tested in isolation, but nothing in the running
// application ever called them - a purchased plan's credits had no way to
// actually be spent.
export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { projectId } = await params;

    const project = await prisma.designProject.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });
    if (!project) throw new NotFoundError("DesignProject");

    const body = parseOrThrow(bodySchema, await request.json());

    try {
      const job = await createAndEnqueueJob({
        projectId,
        ownerId: userId,
        type: body.type,
        idempotencyKey: body.idempotencyKey,
        payload: body.payload,
      });
      return NextResponse.json({ job }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
        throw new ConflictError(
          "Not enough credits remaining on your plan to start this job",
        );
      }
      throw error;
    }
  },
);
