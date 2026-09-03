import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/middleware/requireAuth";
import { getDesignProject } from "@/server/services/designProjectService";
import { designDirectionService } from "@/server/services/designDirectionService";
import { DesignWorkspace } from "./DesignWorkspace";

export default async function DesignProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await requireAuth();
  const project = await getDesignProject(projectId, userId);
  if (!project) notFound();

  const directions = await designDirectionService.listDirections(
    projectId,
    userId,
  );

  return (
    <div>
      <Link
        href={`/properties/${project.propertyId}`}
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Back to home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">
        {project.name}
      </h1>
      {project.room ? (
        <p className="mt-1 font-body text-sm text-ink-soft">
          {project.room.name}
        </p>
      ) : (
        <p className="mt-1 font-body text-sm text-ink-soft">
          Whole property — BOQ generation needs a specific room
        </p>
      )}

      <DesignWorkspace
        projectId={projectId}
        hasRoom={project.roomId !== null}
        initialDirections={directions}
      />
    </div>
  );
}
