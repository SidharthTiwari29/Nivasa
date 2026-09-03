import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { brandRepository } from "@/server/repositories/brandRepository";
import { brandService } from "./brandService";

vi.mock("@/server/repositories/brandRepository", () => ({
  brandRepository: {
    findByName: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    curate: vi.fn(),
  },
}));

const repo = vi.mocked(brandRepository);

describe("brandService.createBrand", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects creating a brand name that already exists", async () => {
    repo.findByName.mockResolvedValue({ id: "brand-1" } as never);

    await expect(
      brandService.createBrand("IKEA", undefined),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("creates a new brand when the name is genuinely unused", async () => {
    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: "brand-1", name: "IKEA" } as never);

    const result = await brandService.createBrand("IKEA", "https://ikea.com");

    expect(result).toEqual({ id: "brand-1", name: "IKEA" });
  });
});

describe("brandService.curateBrand", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects curating a brand that does not exist", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      brandService.curateBrand("brand-1", "admin-1", {
        positioning: "Premium modern furniture",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.curate).not.toHaveBeenCalled();
  });

  it("curates an existing brand, attributing the admin", async () => {
    repo.findById.mockResolvedValue({ id: "brand-1" } as never);
    repo.curate.mockResolvedValue({
      id: "brand-1",
      curatedByUserId: "admin-1",
    } as never);

    const result = await brandService.curateBrand("brand-1", "admin-1", {
      strengths: "Wide dealer network across major Indian cities",
    });

    expect(repo.curate).toHaveBeenCalledWith("brand-1", "admin-1", {
      strengths: "Wide dealer network across major Indian cities",
    });
    expect(result).toEqual({ id: "brand-1", curatedByUserId: "admin-1" });
  });
});
