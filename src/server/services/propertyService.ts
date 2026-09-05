import { propertyRepository } from "@/server/repositories/propertyRepository";
import { NotFoundError } from "@/server/errors/AppError";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "@/server/validators/property";

// Real, necessary conversion applied once, here, for every real caller:
// Prisma returns targetBudgetMinor as a raw BigInt, which both
// JSON.stringify (used internally by every NextResponse.json response
// this service feeds) and Next.js's server-rendering pipeline cannot
// safely carry - JSON.stringify throws unconditionally on a BigInt, and
// passing one into a Server Component's render path or across into a
// Client Component prop is a well-documented source of a hard, generic
// crash. Converting to a plain number at this one, single boundary -
// where every real caller's data already passes through - closes the
// risk everywhere at once, rather than requiring every future caller to
// remember to convert it themselves.
function serializeProperty<T extends { targetBudgetMinor?: bigint | null }>(
  property: T,
): Omit<T, "targetBudgetMinor"> & { targetBudgetMinor: number | null } {
  return {
    ...property,
    // Loose equality deliberately catches both null and undefined - a
    // real property record always has this column (even if its value is
    // null), but test doubles and partial objects elsewhere in this
    // codebase often omit fields entirely rather than setting them to
    // null explicitly, and both should honestly convert to null here,
    // never to NaN.
    targetBudgetMinor:
      property.targetBudgetMinor == null
        ? null
        : Number(property.targetBudgetMinor),
  };
}

export const propertyService = {
  async list(ownerId: string) {
    const properties = await propertyRepository.listForOwner(ownerId);
    return properties.map(serializeProperty);
  },

  async get(id: string, ownerId: string) {
    const property = await propertyRepository.findByIdForOwner(id, ownerId);
    if (!property) throw new NotFoundError("Property");
    return serializeProperty(property);
  },

  async create(ownerId: string, input: CreatePropertyInput) {
    const property = await propertyRepository.create(ownerId, input);
    return serializeProperty(property);
  },

  async update(id: string, ownerId: string, input: UpdatePropertyInput) {
    const result = await propertyRepository.updateForOwner(id, ownerId, input);
    if (result.count === 0) throw new NotFoundError("Property");
    const property = await propertyRepository.findByIdForOwner(id, ownerId);
    return property ? serializeProperty(property) : null;
  },

  async remove(id: string, ownerId: string) {
    const result = await propertyRepository.deleteForOwner(id, ownerId);
    if (result.count === 0) throw new NotFoundError("Property");
  },
};
