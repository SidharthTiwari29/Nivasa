import { prisma } from "@/server/db/prisma";

export const COMMERCIAL_PACKAGES = [
  { code: "FREE", name: "Free", priceMinor: 0n, credits: 1 },
  {
    code: "NIWASTHAN_DESIGN",
    name: "Niwasthan Design",
    priceMinor: 9900n,
    credits: 10,
  },
  {
    code: "NIWASTHAN_COMPLETE",
    name: "Niwasthan Complete",
    priceMinor: 99900n,
    credits: 100,
  },
  {
    code: "NIWASTHAN_HOME_INTELLIGENCE",
    name: "Niwasthan Home Intelligence",
    priceMinor: 259900n,
    credits: 300,
  },
  {
    code: "NIWASTHAN_IMMERSIVE",
    name: "Niwasthan Immersive",
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
