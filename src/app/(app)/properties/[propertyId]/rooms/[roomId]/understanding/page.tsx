import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/middleware/requireAuth";
import { roomService } from "@/server/services/roomService";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";
import { RoomUnderstandingForm } from "./RoomUnderstandingForm";

export default async function RoomUnderstandingPage({
  params,
}: {
  params: Promise<{ propertyId: string; roomId: string }>;
}) {
  const { propertyId, roomId } = await params;
  const { userId } = await requireAuth();

  const rooms = await roomService.list(propertyId, userId);
  const room = rooms.find((r: { id: string }) => r.id === roomId);
  if (!room) notFound();

  const versions = await homeIntelligenceService.listRoomUnderstandings(
    propertyId,
    roomId,
    userId,
  );
  const latest = versions[0] ?? null;

  const otherRooms = rooms
    .filter((r: { id: string }) => r.id !== roomId)
    .map((r: { id: string; name: string }) => ({ id: r.id, name: r.name }));

  return (
    <div>
      <Link
        href={`/properties/${propertyId}`}
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Back to home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">{room.name}</h1>
      <p className="mt-1 font-body text-sm text-ink-soft">
        Confirm this room&apos;s real dimensions and how it connects to the rest
        of your home. This is what every design, budget, and 3D walkthrough is
        built from — nothing downstream is generated until this is confirmed.
      </p>

      <RoomUnderstandingForm
        propertyId={propertyId}
        roomId={roomId}
        roomType={room.type}
        roomName={room.name}
        otherRooms={otherRooms}
        latest={
          latest
            ? {
                status: latest.status,
                dimensions:
                  (latest.dimensions as Record<string, unknown> | null) ?? null,
              }
            : null
        }
      />
    </div>
  );
}
