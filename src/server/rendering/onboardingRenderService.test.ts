import { beforeEach, describe, expect, it, vi } from "vitest";
import { onboardingRenderRepository } from "@/server/repositories/onboardingRenderRepository";
import { onboardingRenderService } from "./onboardingRenderService";

vi.mock("@/server/repositories/onboardingRenderRepository", () => ({
  onboardingRenderRepository: {
    ensureGrant: vi.fn(),
    findForUser: vi.fn(),
    consumeGrant: vi.fn(),
  },
}));

const repo = vi.mocked(onboardingRenderRepository);

describe("onboardingRenderService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("hasUnusedGrant", () => {
    it("returns false when no grant exists for the user at all", async () => {
      repo.findForUser.mockResolvedValue(null);
      expect(await onboardingRenderService.hasUnusedGrant("user-1")).toBe(
        false,
      );
    });

    it("returns true for an existing, unused grant", async () => {
      repo.findForUser.mockResolvedValue({ usedAt: null } as never);
      expect(await onboardingRenderService.hasUnusedGrant("user-1")).toBe(true);
    });

    it("returns false for an already-used grant", async () => {
      repo.findForUser.mockResolvedValue({ usedAt: new Date() } as never);
      expect(await onboardingRenderService.hasUnusedGrant("user-1")).toBe(
        false,
      );
    });
  });

  describe("consumeGrant", () => {
    it("returns false when a concurrent request already consumed the grant (race)", async () => {
      // This is the specific guarantee this feature depends on: two
      // simultaneous render requests for a brand-new user's single free
      // HD grant must not both succeed and produce two free HD renders.
      repo.consumeGrant.mockResolvedValue(false);
      expect(
        await onboardingRenderService.consumeGrant("user-1", "asset-1"),
      ).toBe(false);
    });

    it("returns true when the grant is successfully consumed", async () => {
      repo.consumeGrant.mockResolvedValue(true);
      expect(
        await onboardingRenderService.consumeGrant("user-1", "asset-1"),
      ).toBe(true);
    });
  });
});
