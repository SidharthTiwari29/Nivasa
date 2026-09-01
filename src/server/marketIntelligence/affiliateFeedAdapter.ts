import type { MarketCategory, MarketSourceDefinition } from "./sourceRegistry";
import type { RawMarketRecord } from "./ingestion";
import type {
  MarketSourceAdapter,
  SourceAdapterContext,
  SourceAdapterPage,
} from "./sourceAdapter";

// A real, working governed-adapter implementation - the piece that was
// missing (the registry existed with zero adapters registered against it).
// This targets the common CSV feed format shared by Indian affiliate
// networks (Cuelinks, EarnKaro, Admitad) rather than any one network's
// proprietary API, since the whole point of choosing this ingestion
// channel (per the earlier discussion) is that it's self-serve - no
// negotiated partnership required, just an account and a feed URL - and a
// shared CSV shape means switching networks later doesn't mean rewriting
// this adapter.
export type AffiliateFeedRow = {
  product_id: string;
  product_name: string;
  brand?: string;
  category: string;
  price: string;
  mrp?: string;
  currency?: string;
  product_url: string;
  sku?: string;
  description?: string;
};

export type CategoryMapper = (
  feedCategory: string,
) => MarketCategory | undefined;

// Parses a single CSV line respecting quoted fields containing commas -
// deliberately hand-rolled rather than pulling in a CSV dependency, since
// affiliate feed exports are a well-bounded, simple format and a full CSV
// parser (handling multi-line quoted fields, embedded newlines, etc.) is
// more machinery than this input actually needs.
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseAffiliateFeedCsv(csv: string): AffiliateFeedRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row as unknown as AffiliateFeedRow;
  });
}

// Converts a rupee-denominated price string (e.g. "1499.00" or "1,499") to
// integer minor units (paise) - authoritative money must never pass
// through a floating-point parse, matching the bigint-only convention
// already established for budget/catalogue arithmetic elsewhere.
function rupeesToMinor(value: string | undefined): bigint | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[₹,\s]/g, "");
  if (cleaned === "" || Number.isNaN(Number(cleaned))) return undefined;
  const [rupees, paise = "0"] = cleaned.split(".");
  const paddedPaise = (paise + "00").slice(0, 2);
  return BigInt(rupees) * 100n + BigInt(paddedPaise);
}

export function createAffiliateFeedAdapter(config: {
  sourceKey: string;
  supportedCategories: readonly MarketCategory[];
  fetchFeedCsv: (source: MarketSourceDefinition) => Promise<string>;
  mapCategory: CategoryMapper;
}): MarketSourceAdapter {
  return {
    sourceKey: config.sourceKey,
    supportedCategories: config.supportedCategories,

    async fetchPage(context: SourceAdapterContext): Promise<SourceAdapterPage> {
      const csv = await config.fetchFeedCsv(context.source);
      const rows = parseAffiliateFeedCsv(csv);

      const records: RawMarketRecord[] = [];
      for (const row of rows) {
        const category = config.mapCategory(row.category);
        // Rows whose category doesn't map to a known MarketCategory are
        // skipped, not force-mapped to a guessed default - a wrong
        // category is worse than a missing record, since it corrupts
        // downstream ranking/comparison rather than just omitting an item.
        if (!category) continue;

        const priceMinor = rupeesToMinor(row.price);
        if (!priceMinor) continue;

        records.push({
          sourceKey: config.sourceKey,
          sourceUrl: row.product_url,
          externalId: row.product_id,
          fetchedAt: context.requestedAt,
          name: row.product_name,
          brand: row.brand || undefined,
          category,
          sku: row.sku || undefined,
          description: row.description || undefined,
          currency: "INR",
          priceMinor,
          mrpMinor: rupeesToMinor(row.mrp),
          attributes: {},
        });
      }

      // This adapter fetches the whole feed in one call - affiliate feed
      // exports are typically a single bulk file, not a paginated API, so
      // there is no next page to report.
      return { records };
    },
  };
}
