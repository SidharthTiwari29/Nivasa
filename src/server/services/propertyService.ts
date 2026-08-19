import { prisma } from '@/server/db/prisma';
import { propertyCreateSchema } from '@/server/validators/property';
import { PropertyRepository } from '@/server/repositories/propertyRepository';

const repository = new PropertyRepository(prisma);

export async function createProperty(ownerId: string, rawInput: unknown) {
  const input = propertyCreateSchema.parse(rawInput);
  return repository.create(ownerId, input);
}

export function listProperties(ownerId: string) {
  return repository.listOwned(ownerId);
}
