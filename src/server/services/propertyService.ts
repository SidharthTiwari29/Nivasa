import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { propertyCreateSchema } from '@/server/validators/property';
import { PropertyRepository } from '@/server/repositories/propertyRepository';

const repository = new PropertyRepository(prisma);

export async function createProperty(ownerId: string, rawInput: unknown) {
  const input = propertyCreateSchema.parse(rawInput);
  return repository.create(ownerId, { name: input.name, address: input.address as Prisma.InputJsonValue | undefined });
}

export function listProperties(ownerId: string) {
  return repository.listOwned(ownerId);
}
