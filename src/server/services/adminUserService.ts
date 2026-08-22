import type { Role } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/server/errors/AppError";
import { adminUserRepository } from "@/server/repositories/adminUserRepository";

const PRIVILEGED_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];

export const adminUserService = {
  list() {
    return adminUserRepository.list();
  },

  async get(id: string) {
    const user = await adminUserRepository.findById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async updateRole(actorRole: Role, id: string, role: Role) {
    if (actorRole !== "SUPER_ADMIN" && PRIVILEGED_ROLES.includes(role)) {
      throw new ForbiddenError(
        "Only a super administrator can grant administrator access",
      );
    }

    await this.get(id);
    return adminUserRepository.updateRole(id, role);
  },
};
