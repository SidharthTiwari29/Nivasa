import {
  MARKET_SOURCE_REGISTRY,
  assertMarketSourceRegistry,
  validateMarketSourceRegistry,
} from "./sourceRegistry";

describe("market source registry", () => {
  it("contains a broad multi-category seed universe", () => {
    expect(MARKET_SOURCE_REGISTRY.length).toBeGreaterThanOrEqual(100);
    expect(new Set(MARKET_SOURCE_REGISTRY.map((source) => source.key)).size).toBe(
      MARKET_SOURCE_REGISTRY.length,
    );
    expect(new Set(MARKET_SOURCE_REGISTRY.map((source) => source.domain)).size).toBe(
      MARKET_SOURCE_REGISTRY.length,
    );

    const categories = new Set(
      MARKET_SOURCE_REGISTRY.flatMap((source) => source.categories),
    );
    expect(categories).toEqual(
      expect.objectContaining({
        add: expect.any(Function),
      }),
    );
    expect(categories.has("furniture")).toBe(true);
    expect(categories.has("wardrobes-storage")).toBe(true);
    expect(categories.has("bathroom-sanitary-plumbing")).toBe(true);
    expect(categories.has("hardware")).toBe(true);
    expect(categories.has("lighting")).toBe(true);
    expect(categories.has("electrical")).toBe(true);
    expect(categories.has("appliances")).toBe(true);
  });

  it("has no duplicate or incomplete source records", () => {
    expect(validateMarketSourceRegistry()).toEqual([]);
    expect(() => assertMarketSourceRegistry()).not.toThrow();
  });

  it("keeps every seed source disabled until access and terms are reviewed", () => {
    expect(MARKET_SOURCE_REGISTRY.every((source) => source.ingestionEligible === false)).toBe(
      true,
    );
  });
});
