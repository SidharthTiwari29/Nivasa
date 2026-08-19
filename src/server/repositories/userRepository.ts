import type { PrismaClient, Role } from '@prisma/client';

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  setRole(id: string, role: Role) {
    return this.db.user.update({ where: { id }, data: { role } });
  }
}
