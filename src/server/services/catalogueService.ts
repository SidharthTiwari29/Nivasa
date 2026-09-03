import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";

export function listCatalogue(category?: string) {
  return prisma.catalogueItem.findMany({
    where: { active: true, category },
    include: {
      prices: {
        where: {
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }],
        },
        orderBy: { effectiveFrom: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCatalogueItem(sku: string) {
  const item = await prisma.catalogueItem.findFirst({
    where: { sku, active: true },
    include: { prices: { orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });
  if (!item) return null;

  // A real, computed peer count in the same category - what
  // deriveMeritsAndDemerits' alternativesConsidered actually means: how
  // many other real, currently-active options exist to compare this
  // item against, never a fabricated or estimated number.
  const alternativesConsidered = await prisma.catalogueItem.count({
    where: { category: item.category, active: true },
  });

  return { ...item, alternativesConsidered };
}

export async function upsertCatalogueItem(input: {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  active?: boolean;
}) {
  return prisma.catalogueItem.upsert({
    where: { sku: input.sku },
    create: input,
    update: input,
  });
}

export async function addCataloguePrice(input: {
  sku: string;
  amountMinor: bigint;
  currency?: string;
  effectiveFrom?: Date;
}) {
  const item = await prisma.catalogueItem.findUnique({
    where: { sku: input.sku },
  });
  if (!item) throw new NotFoundError("CatalogueItem");
  return prisma.cataloguePrice.create({
    data: {
      itemId: item.id,
      amountMinor: input.amountMinor,
      currency: input.currency ?? "INR",
      effectiveFrom: input.effectiveFrom ?? new Date(),
    },
  });
}
