import { describe, expect, it } from "vitest";
import { runDesignRealityCheck } from "./designRealityCheck";

describe("runDesignRealityCheck", () => {
  it("blocks insufficient verified circulation", () => {
    const issues = runDesignRealityCheck(
      [],
      [
        {
          elementId: "sofa-1",
          clearanceMinor: 900n,
          measuredClearanceMinor: 650n,
          evidence: "VERIFIED",
        },
      ],
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "INSUFFICIENT_CIRCULATION",
      severity: "BLOCKING",
      evidence: "VERIFIED",
    });
  });

  it("flags furniture intersecting a door", () => {
    const issues = runDesignRealityCheck([
      {
        id: "wardrobe-1",
        xMinor: 0n,
        yMinor: 0n,
        widthMinor: 1000n,
        heightMinor: 500n,
        kind: "FURNITURE",
      },
      {
        id: "door-1",
        xMinor: 500n,
        yMinor: 100n,
        widthMinor: 800n,
        heightMinor: 800n,
        kind: "DOOR",
      },
    ]);

    expect(issues[0]?.code).toBe("DOOR_CLEARANCE_CONFLICT");
    expect(issues[0]?.severity).toBe("BLOCKING");
  });

  it("flags a window conflict without inventing a blocking failure", () => {
    const issues = runDesignRealityCheck([
      {
        id: "desk-1",
        xMinor: 0n,
        yMinor: 0n,
        widthMinor: 1000n,
        heightMinor: 600n,
        kind: "FURNITURE",
      },
      {
        id: "window-1",
        xMinor: 500n,
        yMinor: 100n,
        widthMinor: 900n,
        heightMinor: 700n,
        kind: "WINDOW",
      },
    ]);

    expect(issues[0]).toMatchObject({
      code: "WINDOW_CONFLICT",
      severity: "WARNING",
    });
  });
});
