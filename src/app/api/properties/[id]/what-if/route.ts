import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { propertyIdParamSchema } from "@/server/validators/homeIntelligence";
import { whatIfSchema } from "@/server/validators/whatIf";
import { whatIfService } from "@/server/services/whatIfService";

type RouteParams = { params: Promise<{ id: string }> };

const serializeBigInts = (value: unknown): unknown => {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(serializeBigInts);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeBigInts(nested)]),
    );
  }
  return value;
};

export const POST = withErrorHandling(
  async (request: Request, { params }: RouteParams) => {
    const { userId } = await requireAuth();
    const { id } = parseOrThrow(propertyIdParamSchema, await params);
    const input = parseOrThrow(whatIfSchema, await request.json());

    const result =
      input.action === "preview"
        ? whatIfService.preview(input)
        : await whatIfService.commit(id, userId, input);

    return NextResponse.json({ result: serializeBigInts(result) }, {
      status: input.action === "preview" ? 200 : 201,
    });
  },
);
