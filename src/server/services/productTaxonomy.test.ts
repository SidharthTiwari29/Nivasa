import { describe, expect, it } from "vitest";
import { buildCategoryPath, slugify } from "./productTaxonomy";

const categories = [
  { id: "furniture", name: "Furniture", parentId: null },
  { id: "sofa", name: "Sofa", parentId: "furniture" },
  { id: "2-seater", name: "2 Seater", parentId: "sofa" },
];

describe("buildCategoryPath", () => {
  it("builds the exact real breadcrumb path from the deepest node to the root", () => {
    expect(buildCategoryPath("2-seater", categories)).toBe(
      "Furniture > Sofa > 2 Seater",
    );
  });

  it("builds a single-segment path for a top-level category", () => {
    expect(buildCategoryPath("furniture", categories)).toBe("Furniture");
  });

  it("returns an empty string for an unknown category id rather than throwing", () => {
    expect(buildCategoryPath("does-not-exist", categories)).toBe("");
  });

  it("does not infinite-loop on a corrupted cyclic parent chain", () => {
    const cyclic = [
      { id: "a", name: "A", parentId: "b" },
      { id: "b", name: "B", parentId: "a" },
    ];
    // Must terminate - the exact resulting string matters less than the
    // guarantee that this call returns at all.
    expect(() => buildCategoryPath("a", cyclic)).not.toThrow();
  });
});

describe("slugify", () => {
  it("produces a deterministic, URL-safe slug from a real category name", () => {
    expect(slugify("Walls & Tiles")).toBe("walls-tiles");
  });

  it("collapses multiple special characters into a single hyphen", () => {
    expect(slugify("Home Automation!!")).toBe("home-automation");
  });

  it("produces the same slug for the same input every time", () => {
    expect(slugify("Furniture")).toBe(slugify("Furniture"));
  });
});
