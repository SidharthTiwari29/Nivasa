import { describe, expect, it } from "vitest";
import { renderNotification } from "./notificationPolicy";

describe("renderNotification", () => {
  it("renders localized playful budget messaging", () => {
    expect(
      renderNotification("en-IN", {
        key: "BUDGET_SAVING",
        tone: "PLAYFUL",
        variables: { saving: 12500 },
      }),
    ).toContain("₹12500");
    expect(
      renderNotification("hi-IN", {
        key: "BUDGET_SAVING",
        tone: "PLAYFUL",
        variables: { saving: 12500 },
      }),
    ).toContain("₹12500");
    expect(
      renderNotification("kn-IN", {
        key: "BUDGET_SAVING",
        tone: "PLAYFUL",
        variables: { saving: 12500 },
      }),
    ).toContain("₹12500");
  });

  it("renders build blockers without changing the event semantics", () => {
    expect(
      renderNotification("en-IN", {
        key: "BUILD_BLOCKER",
        tone: "URGENT",
        variables: { message: "door clearance is insufficient" },
      }),
    ).toContain("door clearance is insufficient");
  });
});
