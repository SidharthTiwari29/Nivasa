import { prisma } from "@/server/db/prisma";

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
  return prisma.catalogueItem.findFirst({
    where: { sku, active: true },
    include: { prices: { orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });
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
  if (!item) throw new Error("CATALOGUE_ITEM_NOT_FOUND");
  return prisma.cataloguePrice.create({
    data: {
      itemId: item.id,
      amountMinor: input.amountMinor,
      currency: input.currency ?? "INR",
      effectiveFrom: input.effectiveFrom ?? new Date(),
    },
  });
}
