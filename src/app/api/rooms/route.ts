import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { createRoomSchema } from "@/server/validators/room";
import { roomService } from "@/server/services/roomService";

export const GET = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const propertyId = new URL(request.url).searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "propertyId is required",
        },
      },
      { status: 422 },
    );
  }
  const rooms = await roomService.list(propertyId, userId);
  return NextResponse.json({ rooms });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const body = parseOrThrow(createRoomSchema, await request.json());
  const room = await roomService.create(userId, body);
  return NextResponse.json({ room }, { status: 201 });
});
