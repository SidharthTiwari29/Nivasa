import { describe, expect, it } from "vitest";
import { FAQ_ENTRIES, searchFaq } from "./faq";

describe("FAQ_ENTRIES", () => {
  it("has no duplicate ids", () => {
    const ids = FAQ_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has a non-empty question and answer", () => {
    for (const entry of FAQ_ENTRIES) {
      expect(entry.question.length).toBeGreaterThan(0);
      expect(entry.answer.length).toBeGreaterThan(0);
    }
  });
});

describe("searchFaq", () => {
  it("finds an entry by a keyword in the question", () => {
    const results = searchFaq("negotiate");
    expect(results.some((r) => r.id === "negotiate-quote")).toBe(true);
  });

  it("finds an entry by a keyword only present in the answer", () => {
    const results = searchFaq("razorpay");
    expect(results.some((r) => r.id === "payment-security")).toBe(true);
  });

  it("is case-insensitive", () => {
    const results = searchFaq("BUDGET");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns an empty array for an empty query", () => {
    expect(searchFaq("")).toEqual([]);
    expect(searchFaq("   ")).toEqual([]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchFaq("xyzzynonexistentterm")).toEqual([]);
  });
});
