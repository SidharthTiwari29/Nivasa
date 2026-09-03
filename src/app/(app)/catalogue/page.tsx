import Link from "next/link";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listCatalogue } from "@/server/services/catalogueService";

type CatalogueItemSummary = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string;
  prices: Array<{ amountMinor: bigint }>;
};

function formatRupees(paise: bigint): string {
  return `₹${(paise / 100n).toLocaleString("en-IN")}`;
}

export default async function CataloguePage() {
  await requireAuth();
  const items = await listCatalogue();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Catalogue</h1>
      <p className="mt-2 max-w-xl font-body text-sm text-ink-soft">
        Every product here has a real, verified price. If we haven&apos;t
        confirmed something yet, we say so instead of guessing.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-ink/20 px-8 py-12 text-center">
          <p className="font-body text-sm text-ink-soft">
            No products are in the catalogue yet.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-paper-raised">
          {items.map((item: CatalogueItemSummary) => {
            const price = item.prices[0];
            return (
              <li key={item.id} className="py-4">
                <Link
                  href={`/catalogue/${item.sku}`}
                  className="group flex items-center justify-between"
                >
                  <div>
                    <p className="font-body text-base font-medium text-ink group-hover:text-laterite">
                      {item.name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-ink-soft">
                      {item.brand ?? "Unbranded"} · {item.category}
                    </p>
                  </div>
                  <span className="font-body text-sm font-medium text-ink">
                    {price ? formatRupees(price.amountMinor) : "Price unknown"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
