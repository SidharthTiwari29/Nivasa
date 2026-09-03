import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { catalogueVerificationRepository } from "@/server/repositories/catalogueVerificationRepository";
import { catalogueVerificationService } from "./catalogueVerificationService";

vi.mock("@/server/repositories/catalogueVerificationRepository", () => ({
  catalogueVerificationRepository: {
    findCurrentPrice: vi.fn(),
    verify: vi.fn(),
  },
}));

const repo = vi.mocked(catalogueVerificationRepository);

describe("catalogueVerificationService.verifyCurrentPrice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the item has no current price to verify", async () => {
    repo.findCurrentPrice.mockResolvedValue(null);

    await expect(
      catalogueVerificationService.verifyCurrentPrice("item-1", "admin-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.verify).not.toHaveBeenCalled();
  });

  it("marks the real current price as verified, attributing the admin", async () => {
    repo.findCurrentPrice.mockResolvedValue({ id: "price-1" } as never);
    repo.verify.mockResolvedValue({
      id: "price-1",
      verifiedByUserId: "admin-1",
    } as never);

    const result = await catalogueVerificationService.verifyCurrentPrice(
      "item-1",
      "admin-1",
    );

    expect(repo.verify).toHaveBeenCalledWith("price-1", "admin-1");
    expect(result).toEqual({ id: "price-1", verifiedByUserId: "admin-1" });
  });
});
