import { NextResponse } from "next/server";
import { withErrorHandling } from "@/server/errors/handler";
import { requireAuth } from "@/server/middleware/requireAuth";
import { parseOrThrow } from "@/server/validators/parse";
import { createAssetSchema } from "@/server/validators/asset";
import { assetService } from "@/server/services/assetService";

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const body = parseOrThrow(createAssetSchema, await request.json());
  const result = await assetService.createUpload(userId, body);
  return NextResponse.json(result, { status: 201 });
});
