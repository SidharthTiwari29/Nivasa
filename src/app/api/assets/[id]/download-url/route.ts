import { NextResponse } from "next/server";
import { withErrorHandling } from "@/server/errors/handler";
import { requireAuth } from "@/server/middleware/requireAuth";
import { parseOrThrow } from "@/server/validators/parse";
import { assetIdParamSchema } from "@/server/validators/asset";
import { assetService } from "@/server/services/assetService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(assetIdParamSchema, await params);
    const result = await assetService.createDownloadUrl(id, userId);
    return NextResponse.json(result);
  },
);
