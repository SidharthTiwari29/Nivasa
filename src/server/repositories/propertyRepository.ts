import type { PrismaClient } from '@prisma/client';

export class PropertyRepository {
  constructor(private readonly db: PrismaClient) {}

  create(ownerId: string, input: { name: string; address?: Record<string, unknown> }) {
    return this.db.property.create({
      data: { ownerId, name: input.name, address: input.address },
    });
  }

  findOwnedById(ownerId: string, propertyId: string) {
    return this.db.property.findFirst({ where: { id: propertyId, ownerId } });
  }

  listOwned(ownerId: string) {
    return this.db.property.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  }
}
