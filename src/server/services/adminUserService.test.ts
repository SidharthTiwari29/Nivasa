import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/server/errors/AppError";
import { adminUserRepository } from "@/server/repositories/adminUserRepository";
import { adminUserService } from "./adminUserService";

vi.mock("@/server/repositories/adminUserRepository", () => ({
  adminUserRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    updateRole: vi.fn(),
  },
}));

describe("adminUserService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows an administrator to assign USER and DESIGNER", async () => {
    vi.mocked(adminUserRepository.findById).mockResolvedValue({
      id: "user-1",
    } as never);
    vi.mocked(adminUserRepository.updateRole).mockResolvedValue({
      id: "user-1",
      role: "DESIGNER",
    } as never);

    await adminUserService.updateRole("ADMIN", "user-1", "DESIGNER");

    expect(adminUserRepository.updateRole).toHaveBeenCalledWith(
      "user-1",
      "DESIGNER",
    );
  });

  it("blocks an administrator from granting ADMIN", async () => {
    await expect(
      adminUserService.updateRole("ADMIN", "user-1", "ADMIN"),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(adminUserRepository.updateRole).not.toHaveBeenCalled();
  });

  it("blocks an administrator from granting SUPER_ADMIN", async () => {
    await expect(
      adminUserService.updateRole("ADMIN", "user-1", "SUPER_ADMIN"),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(adminUserRepository.updateRole).not.toHaveBeenCalled();
  });

  it("allows a super administrator to grant ADMIN", async () => {
    vi.mocked(adminUserRepository.findById).mockResolvedValue({
      id: "user-1",
    } as never);
    vi.mocked(adminUserRepository.updateRole).mockResolvedValue({
      id: "user-1",
      role: "ADMIN",
    } as never);

    await adminUserService.updateRole("SUPER_ADMIN", "user-1", "ADMIN");

    expect(adminUserRepository.updateRole).toHaveBeenCalledWith(
      "user-1",
      "ADMIN",
    );
  });

  it("allows a super administrator to grant SUPER_ADMIN", async () => {
    vi.mocked(adminUserRepository.findById).mockResolvedValue({
      id: "user-1",
    } as never);
    vi.mocked(adminUserRepository.updateRole).mockResolvedValue({
      id: "user-1",
      role: "SUPER_ADMIN",
    } as never);

    await adminUserService.updateRole("SUPER_ADMIN", "user-1", "SUPER_ADMIN");

    expect(adminUserRepository.updateRole).toHaveBeenCalledWith(
      "user-1",
      "SUPER_ADMIN",
    );
  });

  it("rejects a missing target user", async () => {
    vi.mocked(adminUserRepository.findById).mockResolvedValue(null);

    await expect(
      adminUserService.updateRole("SUPER_ADMIN", "missing", "USER"),
    ).rejects.toMatchObject({ status: 404 });
    expect(adminUserRepository.updateRole).not.toHaveBeenCalled();
  });
});
