import { describe, expect, it } from "vitest";
import { createWalkthroughRequest } from "./walkthrough";

describe("createWalkthroughRequest", () => {
  it("creates a full-apartment free-roam walkthrough request", () => {
    const request = createWalkthroughRequest({
      jobId: "job-1",
      designRevisionId: "revision-1",
      roomIds: ["living", "kitchen", "bedroom"],
    });
    expect(request.type).toBe("WALKTHROUGH");
    expect(request.input).toMatchObject({
      navigation: "ROOM_TO_ROOM_FREE_ROAM",
      coverage: "FULL_APARTMENT",
      mode: "IMMERSIVE",
    });
  });

  it("rejects incomplete walkthrough inputs", () => {
    expect(() =>
      createWalkthroughRequest({
        jobId: "job-1",
        designRevisionId: "",
        roomIds: ["living"],
      }),
    ).toThrow("DESIGN_REVISION_REQUIRED");
    expect(() =>
      createWalkthroughRequest({
        jobId: "job-1",
        designRevisionId: "revision-1",
        roomIds: [],
      }),
    ).toThrow("WALKTHROUGH_ROOM_REQUIRED");
  });
});
