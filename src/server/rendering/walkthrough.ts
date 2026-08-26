import type { RenderRequest } from "./provider";

export type WalkthroughMode = "IMMERSIVE" | "QUICK_PREVIEW";

export interface WalkthroughInput {
  jobId: string;
  designRevisionId: string;
  roomIds: readonly string[];
  mode?: WalkthroughMode;
}

/** Builds the provider-neutral request for Nivasa Immersive; it never claims rendering succeeded. */
export function createWalkthroughRequest(input: WalkthroughInput): RenderRequest {
  if (!input.jobId.trim()) throw new Error("WALKTHROUGH_JOB_ID_REQUIRED");
  if (!input.designRevisionId.trim()) throw new Error("DESIGN_REVISION_REQUIRED");
  if (input.roomIds.length === 0) throw new Error("WALKTHROUGH_ROOM_REQUIRED");
  if (input.roomIds.some((roomId) => !roomId.trim())) throw new Error("WALKTHROUGH_ROOM_ID_INVALID");

  return {
    jobId: input.jobId,
    type: "WALKTHROUGH",
    input: {
      designRevisionId: input.designRevisionId,
      roomIds: [...input.roomIds],
      mode: input.mode ?? "IMMERSIVE",
      navigation: "ROOM_TO_ROOM_FREE_ROAM",
      coverage: "FULL_APARTMENT",
    },
  };
}
