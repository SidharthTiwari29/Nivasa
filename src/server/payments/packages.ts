import { prisma } from "@/server/db/prisma";

export const COMMERCIAL_PACKAGES = [
  { code: "FREE", name: "Free", priceMinor: 0n, credits: 1 },
  {
    code: "NIVASA_DESIGN",
    name: "Nivasa Design",
    priceMinor: 9900n,
    credits: 10,
  },
  {
    code: "NIVASA_COMPLETE",
    name: "Nivasa Complete",
    priceMinor: 99900n,
    credits: 100,
  },
  {
    code: "NIVASA_HOME_INTELLIGENCE",
    name: "Nivasa Home Intelligence",
    priceMinor: 259900n,
    credits: 300,
  },
  {
    code: "NIVASA_IMMERSIVE",
    name: "Nivasa Immersive",
    priceMinor: 999900n,
    credits: 1000,
  },
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
}
