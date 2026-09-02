import { prisma } from "@/server/db/prisma";

export const designBattleRepository = {
  // Explicit return types here are load-bearing, not stylistic: without
  // them, TypeScript infers Prisma's internal "fluent client" return
  // type (Prisma__DesignProjectClient<...>, with chainable relation
  // methods) instead of a plain Promise<T | null> - real CI's typecheck
  // caught this exact mismatch when a test's mockResolvedValue/
  // mockImplementation couldn't satisfy that inferred shape. Declaring
  // the plain, real shape here fixes it at the source, once, rather than
  // needing a cast scattered across every test that mocks these methods.
  findProjectForOwner(
    projectId: string,
    ownerId: string,
  ): Promise<{ id: string; name: string } | null> {
    return prisma.designProject.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true, name: true },
    });
  },

  findLatestBoqForProject(
    projectId: string,
  ): Promise<{ totalMinor: bigint; currency: string } | null> {
    return prisma.boq.findFirst({
      where: { projectId },
      orderBy: { version: "desc" },
      select: { totalMinor: true, currency: true },
    });
  },
};
