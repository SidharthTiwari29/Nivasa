import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { updateRoomSchema, roomIdParamSchema } from "@/server/validators/room";
import { roomService } from "@/server/services/roomService";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(roomIdParamSchema, await params);
  const room = await roomService.get(id, userId);
  return NextResponse.json({ room });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(roomIdParamSchema, await params);
  const body = parseOrThrow(updateRoomSchema, await request.json());
  const room = await roomService.update(id, userId, body);
  return NextResponse.json({ room });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const { userId } = await requireAuth();
  const { id } = parseOrThrow(roomIdParamSchema, await params);
  await roomService.remove(id, userId);
  return new NextResponse(null, { status: 204 });
});
