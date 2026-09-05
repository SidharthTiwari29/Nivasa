import { prisma } from "@/server/db/prisma";

/**
 * Canonical customer-facing commercial ladder.
 *
 * Keep historical package codes readable in entitlement checks so existing
 * purchases remain valid, but do not create new purchases against them.
 */
export const COMMERCIAL_PACKAGES = [
  {
    code: "NIWASTHAN_STARTER",
    name: "Niwasthan Starter",
    priceMinor: 19900n,
    credits: 1,
  },
  {
    code: "NIWASTHAN_DESIGN",
    name: "Niwasthan Design",
    priceMinor: 99900n,
    credits: 10,
  },
  {
    code: "NIWASTHAN_HOME_BOOK",
    name: "Niwasthan Home Book",
    priceMinor: 259900n,
    credits: 100,
  },
  {
    code: "NIWASTHAN_IMMERSIVE",
    name: "Niwasthan Immersive",
    priceMinor: 999900n,
    credits: 1000,
  },
] as const;

const LEGACY_PACKAGE_CODES = [
  "FREE",
  "NIWASTHAN_COMPLETE",
  "NIWASTHAN_HOME_INTELLIGENCE",
] as const;

export async function ensureCommercialPackages() {
  for (const item of COMMERCIAL_PACKAGES) {
    await prisma.package.upsert({
      where: { code: item.code },
      create: item,
      update: {
        name: item.name,
        priceMinor: item.priceMinor,
        credits: item.credits,
        active: true,
      },
    });
  }

  // Retire legacy sellable packages without deleting them. Existing
  // purchases/entitlements may still reference these historical codes.
  await prisma.package.updateMany({
    where: { code: { in: [...LEGACY_PACKAGE_CODES] } },
    data: { active: false },
  });
}
