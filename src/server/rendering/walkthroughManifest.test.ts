import { describe, expect, it } from "vitest";
import { createWalkthroughManifest } from "./walkthroughManifest";

describe("createWalkthroughManifest", () => {
  it("creates a deterministic full-apartment free-roam manifest", () => {
    const result = createWalkthroughManifest("project-1", [
      { roomId: "bedroom", sequence: 1, entryPoint: { x: 0, y: 0, z: 0 } },
      { roomId: "living", sequence: 0, entryPoint: { x: 1, y: 0, z: 1 } },
    ]);
    expect(result.mode).toBe("FREE_ROAM");
    expect(result.includeNookAndCornerCoverage).toBe(true);
    expect(result.rooms.map((room) => room.roomId)).toEqual(["living", "bedroom"]);
  });

  it("rejects duplicate room sequences", () => {
    expect(() => createWalkthroughManifest("project-1", [
      { roomId: "a", sequence: 0, entryPoint: { x: 0, y: 0, z: 0 } },
      { roomId: "b", sequence: 0, entryPoint: { x: 1, y: 0, z: 1 } },
    ])).toThrow("room sequence must be unique");
  });
});
