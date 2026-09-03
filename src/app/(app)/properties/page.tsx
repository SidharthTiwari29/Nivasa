import Link from "next/link";
import { requireAuth } from "@/server/middleware/requireAuth";
import { propertyService } from "@/server/services/propertyService";
import { CreatePropertyForm } from "./CreatePropertyForm";

type PropertySummary = {
  id: string;
  name: string;
  address: string | null;
};

export default async function PropertiesPage() {
  const { userId } = await requireAuth();
  const properties = await propertyService.list(userId);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Your homes</h1>
      <p className="mt-2 font-body text-sm text-ink-soft">
        Add a home to start understanding it, designing it, and pricing it for
        real.
      </p>

      {properties.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-ink/20 px-8 py-12 text-center">
          <p className="font-body text-sm text-ink-soft">
            You haven&apos;t added a home yet. Add one below to begin.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-paper-raised">
          {properties.map((property: PropertySummary) => (
            <li key={property.id} className="py-4">
              <Link
                href={`/properties/${property.id}`}
                className="group flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-base font-medium text-ink group-hover:text-laterite">
                    {property.name}
                  </p>
                  {property.address ? (
                    <p className="mt-1 font-body text-sm text-ink-soft">
                      {property.address}
                    </p>
                  ) : null}
                </div>
                <span className="font-body text-sm text-ink-soft group-hover:text-laterite">
                  View →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 border-t border-paper-raised pt-8">
        <h2 className="font-display text-lg font-semibold">Add a home</h2>
        <CreatePropertyForm />
      </div>
    </div>
  );
}
