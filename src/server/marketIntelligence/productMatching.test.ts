import { describe, expect, it } from "vitest";
import { matchProducts } from "./productMatching";

const base = {
  sourceKey: "source-a",
  externalId: "a-1",
  sku: "SKU-100",
  brand: "Example",
  name: "Handle 128mm",
  category: "hardware" as const,
  attributes: { material: "brass", finish: "matte black", size: "128mm" },
};

describe("product matching", () => {
  it("recognizes identical source identity", () => {
    expect(matchProducts(base, base).kind).toBe("EXACT_SOURCE");
    expect(matchProducts(base, base).confidenceBps).toBe(10000);
  });

  it("recognizes exact SKU across sources only with brand and category agreement", () => {
    const other = { ...base, sourceKey: "source-b", externalId: "b-7" };
    expect(matchProducts(base, other)).toMatchObject({
      kind: "EXACT_SKU",
      confidenceBps: 9950,
    });
  });

  it("allows conservative equivalence when identity attributes agree", () => {
    const other = {
      ...base,
      sourceKey: "source-b",
      externalId: "b-7",
      sku: "OTHER-SKU",
    };
    expect(matchProducts(base, other).kind).toBe("EQUIVALENT");
  });

  it("does not turn a visually similar but weakly evidenced item into a match", () => {
    const other = {
      ...base,
      sourceKey: "source-b",
      externalId: "b-7",
      sku: "OTHER-SKU",
      name: "Handle 160mm",
      attributes: { material: "steel", finish: "chrome", size: "160mm" },
    };
    expect(matchProducts(base, other).kind).toBe("NO_MATCH");
  });
});
