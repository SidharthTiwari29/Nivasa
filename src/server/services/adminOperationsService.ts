import { prisma } from "@/server/db/prisma";

export function listPackages() {
  return prisma.package.findMany({ orderBy: { createdAt: "asc" } });
}
export function listEntitlements(limit = 100) {
  return prisma.entitlement.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
    include: {
      package: true,
      user: { select: { id: true, email: true, role: true } },
    },
  });
}
export function listJobs(limit = 100) {
  return prisma.aIJob.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
    select: {
      id: true,
      projectId: true,
      type: true,
      status: true,
      provider: true,
      attempts: true,
      createdAt: true,
      completedAt: true,
      errorCode: true,
    },
  });
}
export async function getAIUsageSummary() {
  const rows = await prisma.aIJob.groupBy({
    by: ["provider", "status"],
    _count: { _all: true },
  });
  return rows.map((row) => ({
    provider: row.provider ?? "unconfigured",
    status: row.status,
    jobs: row._count._all,
  }));
}
export function listCatalogueForAdmin(limit = 100) {
  return prisma.catalogueItem.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
    include: { prices: true },
  });
}
