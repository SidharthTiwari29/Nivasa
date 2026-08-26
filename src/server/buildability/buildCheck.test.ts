import { describe, expect, it } from "vitest";
import { runBuildCheck } from "./buildCheck";

describe("runBuildCheck", () => {
  it("passes valid room items", () => {
    expect(
      runBuildCheck({
        roomId: "room-1",
        roomAreaSqFt: 120,
        items: [
          { itemId: "wardrobe", quantity: 1, widthMm: 1800, depthMm: 600 },
        ],
      }).buildable,
    ).toBe(true);
  });

  it("blocks invalid quantities and dimensions", () => {
    const result = runBuildCheck({
      roomId: "room-1",
      items: [{ itemId: "wardrobe", quantity: 0, widthMm: -1 }],
    });
    expect(result.buildable).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "INVALID_QUANTITY",
      "INVALID_WIDTH",
    ]);
  });

  it("blocks missing room identity", () => {
    expect(runBuildCheck({ roomId: "", items: [] }).findings[0]?.code).toBe(
      "ROOM_ID_REQUIRED",
    );
  });
});
