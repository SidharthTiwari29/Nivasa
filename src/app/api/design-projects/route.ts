import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createDesignProject } from "@/server/services/designProjectService";

const bodySchema = z.object({
  propertyId: z.string().min(1),
  roomId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(200),
});

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const { propertyId, roomId, name } = parseOrThrow(
    bodySchema,
    await request.json(),
  );
  const project = await createDesignProject({
    ownerId: userId,
    propertyId,
    roomId,
    name,
  });
  return NextResponse.json({ project }, { status: 201 });
});
