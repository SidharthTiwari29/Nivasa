import { describe, expect, it } from "vitest";
import { authorizeAssistantAction } from "./assistantPolicy";

describe("authorizeAssistantAction", () => {
  it("requires evidence and human approval for procurement", () => {
    expect(
      authorizeAssistantAction({
        intent: "PROCUREMENT",
        propertyId: "p1",
        input: "approve quote",
        language: "en-IN",
      }),
    ).toEqual({
      allowed: true,
      requiresEvidence: true,
      requiresHumanApproval: true,
    });
  });

  it("allows what-if analysis with evidence without approval", () => {
    expect(
      authorizeAssistantAction({
        intent: "WHAT_IF",
        propertyId: "p1",
        input: "replace marble",
        language: "en-IN",
      }),
    ).toEqual({
      allowed: true,
      requiresEvidence: true,
      requiresHumanApproval: false,
    });
  });
});
