import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { designBattleService } from "@/server/services/designBattleService";

const querySchema = z.object({
  projectAId: z.string().min(1),
  projectBId: z.string().min(1),
});

export const GET = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const url = new URL(request.url);
  const { projectAId, projectBId } = parseOrThrow(querySchema, {
    projectAId: url.searchParams.get("projectAId"),
    projectBId: url.searchParams.get("projectBId"),
  });
  const result = await designBattleService.battle(
    projectAId,
    projectBId,
    userId,
  );
  return NextResponse.json(result);
});
