import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/middleware/requireAuth";
import { propertyService } from "@/server/services/propertyService";
import { floorPlanService } from "@/server/services/floorPlanService";
import { FloorPlanUploadForm } from "./FloorPlanUploadForm";

export default async function FloorPlanPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const { userId } = await requireAuth();

  const property = await propertyService.get(propertyId, userId);
  if (!property) notFound();

  const floorPlans = await floorPlanService.list(propertyId, userId);

  return (
    <div>
      <Link
        href={`/properties/${propertyId}`}
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Back to home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">Floor plan</h1>
      <p className="mt-1 font-body text-sm text-ink-soft">
        Upload a photo or PDF of your floor plan. This is a real record we keep
        with your home — confirming each room&apos;s actual dimensions still
        happens separately, since a photo alone is not the same as a verified
        measurement.
      </p>

      {floorPlans.length > 0 ? (
        <ul className="mt-6 divide-y divide-paper-raised">
          {floorPlans.map(
            (fp: { id: string; version: number; createdAt: Date }) => (
              <li
                key={fp.id}
                className="flex items-center justify-between py-3"
              >
                <span className="font-body text-sm text-ink">
                  Version {fp.version}
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {new Date(fp.createdAt).toLocaleDateString()}
                </span>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="mt-6 font-body text-sm text-ink-soft">
          No floor plan uploaded yet.
        </p>
      )}

      <div className="mt-8 border-t border-paper-raised pt-6">
        <FloorPlanUploadForm propertyId={propertyId} />
      </div>
    </div>
  );
}
