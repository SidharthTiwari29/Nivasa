import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/authorization";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createSubstitutionSchema } from "@/server/validators/substitution";
import { substitutionService } from "@/server/services/substitutionService";

export const POST = withErrorHandling(async (request: Request) => {
  const admin = await requireAdmin();
  const body = parseOrThrow(createSubstitutionSchema, await request.json());
  const substitution = await substitutionService.create(admin.id, body);
  return NextResponse.json({ substitution }, { status: 201 });
});
