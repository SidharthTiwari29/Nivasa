import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packages = [
  { code: 'FREE', name: 'Free', currency: 'INR', priceMinor: 0 },
  { code: 'NIVASA_DESIGN', name: 'Nivasa Design', currency: 'INR', priceMinor: 9_900 },
  { code: 'NIVASA_COMPLETE', name: 'Nivasa Complete', currency: 'INR', priceMinor: 99_900 },
  { code: 'NIVASA_PRO', name: 'Nivasa Pro', currency: 'INR', priceMinor: 999_900 },
] as const;

async function main() {
  for (const pkg of packages) {
    await prisma.package.upsert({ where: { code: pkg.code }, update: pkg, create: pkg });
  }
}

main().finally(async () => prisma.$disconnect());
