import Link from "next/link";
import { requireAuth } from "@/server/middleware/requireAuth";
import { propertyService } from "@/server/services/propertyService";
import { roomService } from "@/server/services/roomService";
import { listDesignProjectsForProperty } from "@/server/services/designProjectService";
import { CreateRoomForm } from "./CreateRoomForm";
import { CreateDesignProjectForm } from "./CreateDesignProjectForm";

type RoomSummary = {
  id: string;
  name: string;
  type: string;
  areaSqFt: { toString(): string } | null;
};

type DesignProjectSummary = {
  id: string;
  name: string;
  status: string;
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  LIVING_ROOM: "Living room",
  BEDROOM: "Bedroom",
  KITCHEN: "Kitchen",
  BATHROOM: "Bathroom",
  DINING_ROOM: "Dining room",
  BALCONY: "Balcony",
  STUDY: "Study",
  OTHER: "Other",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const { userId } = await requireAuth();
  const property = await propertyService.get(propertyId, userId);
  const rooms = await roomService.list(propertyId, userId);
  const designProjects = await listDesignProjectsForProperty(
    propertyId,
    userId,
  );

  return (
    <div>
      <Link
        href="/properties"
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Your homes
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">
        {property.name}
      </h1>
      {property.address ? (
        <p className="mt-1 font-body text-sm text-ink-soft">
          {property.address}
        </p>
      ) : null}
      <Link
        href={`/properties/${propertyId}/floor-plan`}
        className="mt-3 inline-block font-body text-sm font-medium text-laterite hover:underline"
      >
        Upload floor plan →
      </Link>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold">Rooms</h2>
        {rooms.length === 0 ? (
          <p className="mt-3 font-body text-sm text-ink-soft">
            Add your first room to start understanding this home.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-paper-raised">
            {rooms.map((room: RoomSummary) => (
              <li
                key={room.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-body text-sm font-medium text-ink">
                    {room.name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-soft">
                    {ROOM_TYPE_LABELS[room.type] ?? room.type}
                    {room.areaSqFt
                      ? ` · ${room.areaSqFt.toString()} sq ft`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/properties/${propertyId}/rooms/${room.id}/understanding`}
                  className="font-body text-xs font-medium text-laterite hover:underline"
                >
                  Confirm dimensions
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-paper-raised pt-6">
          <h3 className="font-body text-sm font-semibold text-ink">
            Add a room
          </h3>
          <CreateRoomForm propertyId={propertyId} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold">Designs</h2>
        {designProjects.length === 0 ? (
          <p className="mt-3 font-body text-sm text-ink-soft">
            Start a design to see real directions, products, and pricing for
            this home.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-paper-raised">
            {designProjects.map((project: DesignProjectSummary) => (
              <li key={project.id} className="py-3">
                <Link
                  href={`/designs/${project.id}`}
                  className="group flex items-center justify-between"
                >
                  <span className="font-body text-sm font-medium text-ink group-hover:text-laterite">
                    {project.name}
                  </span>
                  <span className="font-mono text-xs text-ink-soft">
                    {project.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-paper-raised pt-6">
          <h3 className="font-body text-sm font-semibold text-ink">
            Start a design
          </h3>
          <CreateDesignProjectForm propertyId={propertyId} rooms={rooms} />
        </div>
      </div>
    </div>
  );
}
