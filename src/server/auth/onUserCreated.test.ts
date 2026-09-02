import { beforeEach, describe, expect, it, vi } from "vitest";
import { onboardingRenderService } from "@/server/rendering/onboardingRenderService";
import { handleUserCreated } from "./onUserCreated";

vi.mock("@/server/rendering/onboardingRenderService", () => ({
  onboardingRenderService: { grantOnSignup: vi.fn() },
}));

const grants = vi.mocked(onboardingRenderService);

describe("handleUserCreated", () => {
  beforeEach(() => vi.clearAllMocks());

  it("grants the onboarding render for a new user", async () => {
    grants.grantOnSignup.mockResolvedValue({ id: "grant-1" } as never);

    await handleUserCreated("user-1");

    expect(grants.grantOnSignup).toHaveBeenCalledWith("user-1");
  });

  it("never throws even if the grant creation fails - must not block account creation", async () => {
    grants.grantOnSignup.mockRejectedValue(new Error("db unavailable"));

    await expect(handleUserCreated("user-1")).resolves.toBeUndefined();
  });
});
