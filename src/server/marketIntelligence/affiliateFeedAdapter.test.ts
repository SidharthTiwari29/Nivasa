import { describe, expect, it, vi } from "vitest";
import {
  createAffiliateFeedAdapter,
  parseAffiliateFeedCsv,
} from "./affiliateFeedAdapter";

describe("parseAffiliateFeedCsv", () => {
  it("parses a well-formed feed with a header row", () => {
    const csv =
      "product_id,product_name,price,product_url\n" +
      "p1,Modular Wardrobe,15999.00,https://example.com/p1";
    const rows = parseAffiliateFeedCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].product_name).toBe("Modular Wardrobe");
  });

  it("handles a quoted field containing a comma", () => {
    const csv =
      "product_id,product_name,price,product_url\n" +
      'p1,"Sofa, 3-Seater",25000,https://example.com/p1';
    const rows = parseAffiliateFeedCsv(csv);
    expect(rows[0].product_name).toBe("Sofa, 3-Seater");
  });

  it("returns an empty array for an empty feed", () => {
    expect(parseAffiliateFeedCsv("")).toEqual([]);
  });

  it("returns an empty array for a header-only feed", () => {
    expect(
      parseAffiliateFeedCsv("product_id,product_name,price,product_url"),
    ).toEqual([]);
  });
});

describe("createAffiliateFeedAdapter", () => {
  it("converts a rupee price string to correct integer minor units (paise)", async () => {
    const csv =
      "product_id,product_name,category,price,product_url\n" +
      "p1,Sofa,Sofas,1499.50,https://example.com/p1";
    const adapterWithFeed = createAffiliateFeedAdapter({
      sourceKey: "test-affiliate-network",
      supportedCategories: ["furniture"],
      fetchFeedCsv: async () => csv,
      mapCategory: (c) => (c === "Sofas" ? "furniture" : undefined),
    });

    const page = await adapterWithFeed.fetchPage({
      source: { key: "test-affiliate-network" } as never,
      requestedAt: new Date(),
    });

    // 1499.50 rupees = 149950 paise, verified by hand: 1499 * 100 + 50.
    expect(page.records[0].priceMinor).toBe(149_950n);
  });

  it("handles a comma-formatted rupee price (e.g. '1,499')", async () => {
    const csv =
      "product_id,product_name,category,price,product_url\n" +
      'p1,Sofa,Sofas,"1,499",https://example.com/p1';
    const adapterWithFeed = createAffiliateFeedAdapter({
      sourceKey: "test-affiliate-network",
      supportedCategories: ["furniture"],
      fetchFeedCsv: async () => csv,
      mapCategory: (c) => (c === "Sofas" ? "furniture" : undefined),
    });

    const page = await adapterWithFeed.fetchPage({
      source: { key: "test-affiliate-network" } as never,
      requestedAt: new Date(),
    });

    // 1,499 rupees, no decimal = 149900 paise.
    expect(page.records[0].priceMinor).toBe(149_900n);
  });

  it("skips a row whose category does not map to a known MarketCategory", async () => {
    const csv =
      "product_id,product_name,category,price,product_url\n" +
      "p1,Unknown Item,SomeUnmappedCategory,1000,https://example.com/p1";
    const adapterWithFeed = createAffiliateFeedAdapter({
      sourceKey: "test-affiliate-network",
      supportedCategories: ["furniture"],
      fetchFeedCsv: async () => csv,
      mapCategory: () => undefined,
    });

    const page = await adapterWithFeed.fetchPage({
      source: { key: "test-affiliate-network" } as never,
      requestedAt: new Date(),
    });

    expect(page.records).toHaveLength(0);
  });

  it("skips a row with an unparseable or missing price rather than fabricating a fallback", async () => {
    const csv =
      "product_id,product_name,category,price,product_url\n" +
      "p1,No Price Item,Sofas,,https://example.com/p1";
    const adapterWithFeed = createAffiliateFeedAdapter({
      sourceKey: "test-affiliate-network",
      supportedCategories: ["furniture"],
      fetchFeedCsv: async () => csv,
      mapCategory: (c) => (c === "Sofas" ? "furniture" : undefined),
    });

    const page = await adapterWithFeed.fetchPage({
      source: { key: "test-affiliate-network" } as never,
      requestedAt: new Date(),
    });

    expect(page.records).toHaveLength(0);
  });

  it("reports no next cursor, since a feed export is fetched whole", async () => {
    const csv = "product_id,product_name,category,price,product_url";
    const adapterWithFeed = createAffiliateFeedAdapter({
      sourceKey: "test-affiliate-network",
      supportedCategories: ["furniture"],
      fetchFeedCsv: async () => csv,
      mapCategory: () => "furniture",
    });

    const page = await adapterWithFeed.fetchPage({
      source: { key: "test-affiliate-network" } as never,
      requestedAt: new Date(),
    });

    expect(page.nextCursor).toBeUndefined();
  });
});
