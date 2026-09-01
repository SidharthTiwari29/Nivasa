import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { catalogueItemIdParamSchema } from "@/server/validators/substitution";
import { substitutionService } from "@/server/services/substitutionService";

type RouteParams = { params: Promise<{ catalogueItemId: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    await requireAuth();
    const { catalogueItemId } = parseOrThrow(
      catalogueItemIdParamSchema,
      await params,
    );
    const substitutions =
      await substitutionService.listForItem(catalogueItemId);
    return NextResponse.json({ substitutions });
  },
);
