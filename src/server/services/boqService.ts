import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { calculateCost } from "./costing";

export async function createBoq(input: {
  ownerId: string;
  projectId: string;
  lines: Array<{
    catalogueItemId?: string;
    description: string;
    quantity: bigint;
    unit: string;
    unitPriceMinor: bigint;
    labourMinor?: bigint;
    materialMinor?: bigint;
    taxRateBps?: bigint;
    wastageBps?: bigint;
    discountMinor?: bigint;
  }>;
}) {
  const project = await prisma.designProject.findFirst({
    where: { id: input.projectId, ownerId: input.ownerId },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const latest = await prisma.boq.findFirst({
    where: { projectId: input.projectId },
    orderBy: { version: "desc" },
  });
  const totals = calculateCost(input.lines);
  const version = (latest?.version ?? 0) + 1;
  const snapshot = input.lines.map((line) => ({
    ...line,
    quantity: line.quantity.toString(),
    unitPriceMinor: line.unitPriceMinor.toString(),
    labourMinor: (line.labourMinor ?? 0n).toString(),
    materialMinor: (line.materialMinor ?? 0n).toString(),
  }));
  return prisma.boq.create({
    data: {
      projectId: input.projectId,
      version,
      currency: "INR",
      subtotalMinor: totals.subtotalMinor,
      wastageMinor: totals.wastageMinor,
      taxMinor: totals.taxMinor,
      discountMinor: totals.discountMinor,
      totalMinor: totals.totalMinor,
      snapshot: snapshot as Prisma.InputJsonValue,
      lines: {
        create: input.lines.map((line) => ({
          catalogueItemId: line.catalogueItemId,
          description: line.description,
          quantity: line.quantity.toString(),
          unit: line.unit,
          unitPriceMinor: line.unitPriceMinor,
          labourMinor: line.labourMinor ?? 0n,
          materialMinor: line.materialMinor ?? 0n,
          taxRateBps: Number(line.taxRateBps ?? 0n),
          wastageBps: Number(line.wastageBps ?? 0n),
          discountMinor: line.discountMinor ?? 0n,
          lineTotalMinor:
            line.quantity * line.unitPriceMinor +
            (line.materialMinor ?? 0n) +
            (line.labourMinor ?? 0n),
        })),
      },
    },
    include: { lines: true },
  });
}
