import { describe, expect, it } from "vitest";
import { checkClearances } from "./clearanceCheck";

describe("checkClearances", () => {
  it("reports a blocker when configured clearance is insufficient", () => {
    const findings = checkClearances({
      itemId: "wardrobe",
      frontClearanceMm: 450,
      rules: [{ code: "FRONT_CLEARANCE", minimumMm: 600, message: "Door opening clearance is insufficient." }],
    });
    expect(findings[0]).toMatchObject({ code: "FRONT_CLEARANCE", severity: "BLOCKER", actualMm: 450, requiredMm: 600 });
  });

  it("passes when clearance meets the configured rule", () => {
    expect(checkClearances({ itemId: "wardrobe", frontClearanceMm: 600, rules: [{ code: "FRONT_CLEARANCE", minimumMm: 600, message: "ok" }] })).toEqual([]);
  });
});
