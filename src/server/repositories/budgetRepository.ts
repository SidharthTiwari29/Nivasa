import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { BudgetImpactInput, CreateBudgetInput } from "@/server/validators/budget";

interface BudgetVersionRow {
  id: string;
  planId: string;
  version: number;
  homeIntelligenceVersion: number | null;
  homeDnaVersion: number | null;
  totalLowMinor: bigint;
  totalTargetMinor: bigint;
  totalHighMinor: bigint;
  contingencyMinor: bigint;
  truth: string;
  scope: unknown;
  assumptions: unknown;
  sourceReferences: unknown;
  createdByUserId: string;
  idempotencyKey: string;
  createdAt: Date;
}

async function serializable<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt === 2
      ) {
        throw error;
      }
    }
  }
  throw new Error("Serializable transaction failed after retries");
}

const json = (value: unknown) => JSON.stringify(value);

export const budgetRepository = {
  async findPlan(propertyId: string, ownerId: string) {
    const plans = await prisma.$queryRaw<Array<{
      id: string;
      propertyId: string;
      ownerId: string;
      currency: string;
      status: string;
      lockedVersion: number | null;
      lockedAt: Date | null;
      lockedByUserId: string | null;
    }>>(Prisma.sql`
      SELECT "id", "propertyId", "ownerId", "currency", "status",
             "lockedVersion", "lockedAt", "lockedByUserId"
      FROM "BudgetPlan"
      WHERE "propertyId" = ${propertyId} AND "ownerId" = ${ownerId}
    `);

    if (!plans[0]) return null;

    const versions = await prisma.$queryRaw<BudgetVersionRow[]>(Prisma.sql`
      SELECT "id", "planId", "version", "homeIntelligenceVersion",
             "homeDnaVersion", "totalLowMinor", "totalTargetMinor",
             "totalHighMinor", "contingencyMinor", "truth", "scope",
             "assumptions", "sourceReferences", "createdByUserId",
             "idempotencyKey", "createdAt"
      FROM "BudgetVersion"
      WHERE "planId" = ${plans[0].id}
      ORDER BY "version" DESC
    `);

    const lines = versions.length
      ? await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
          SELECT "id", "budgetVersionId", "roomId", "category", "description",
                 "lowMinor", "targetMinor", "highMinor", "truth", "basis"
          FROM "BudgetLine"
          WHERE "budgetVersionId" IN (${Prisma.join(versions.map((v) => v.id))})
          ORDER BY "createdAt" ASC
        `)
      : [];

    return {
      plan: plans[0],
      versions: versions.map((version) => ({
        ...version,
        lines: lines.filter((line) => line.budgetVersionId === version.id),
      })),
    };
  },

  async createVersion(propertyId: string, ownerId: string, input: CreateBudgetInput) {
    return serializable(async (tx) => {
      const property = await tx.property.findFirst({
        where: { id: propertyId, ownerId },
        select: { id: true },
      });
      if (!property) return null;

      const existingPlan = await tx.$queryRaw<Array<{ id: string; status: string }>>(Prisma.sql`
        SELECT "id", "status" FROM "BudgetPlan"
        WHERE "propertyId" = ${propertyId} AND "ownerId" = ${ownerId}
        FOR UPDATE
      `);

      const planId = existingPlan[0]?.id ?? crypto.randomUUID();
      if (!existingPlan[0]) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "BudgetPlan" ("id", "propertyId", "ownerId", "currency", "status", "createdAt", "updatedAt")
          VALUES (${planId}, ${propertyId}, ${ownerId}, 'INR', 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } else if (existingPlan[0].status === "LOCKED") {
        throw new Error("BUDGET_LOCKED");
      }

      const existing = await tx.$queryRaw<BudgetVersionRow[]>(Prisma.sql`
        SELECT "id", "planId", "version", "homeIntelligenceVersion",
               "homeDnaVersion", "totalLowMinor", "totalTargetMinor",
               "totalHighMinor", "contingencyMinor", "truth", "scope",
               "assumptions", "sourceReferences", "createdByUserId",
               "idempotencyKey", "createdAt"
        FROM "BudgetVersion"
        WHERE "planId" = ${planId} AND "idempotencyKey" = ${input.idempotencyKey}
        LIMIT 1
      `);
      if (existing[0]) return existing[0];

      const latest = await tx.$queryRaw<Array<{ version: number }>>(Prisma.sql`
        SELECT "version" FROM "BudgetVersion"
        WHERE "planId" = ${planId}
        ORDER BY "version" DESC
        LIMIT 1
      `);
      const version = (latest[0]?.version ?? 0) + 1;
      const totalLowMinor = input.lines.reduce((sum, line) => sum + BigInt(line.lowMinor), 0n);
      const totalTargetMinor = input.lines.reduce((sum, line) => sum + BigInt(line.targetMinor), 0n);
      const totalHighMinor = input.lines.reduce((sum, line) => sum + BigInt(line.highMinor), 0n);
      const id = crypto.randomUUID();

      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "BudgetVersion" (
          "id", "planId", "version", "homeIntelligenceVersion", "homeDnaVersion",
          "totalLowMinor", "totalTargetMinor", "totalHighMinor", "contingencyMinor",
          "truth", "scope", "assumptions", "sourceReferences", "createdByUserId",
          "idempotencyKey", "createdAt"
        ) VALUES (
          ${id}, ${planId}, ${version}, ${input.homeIntelligenceVersion ?? null},
          ${input.homeDnaVersion ?? null}, ${totalLowMinor}, ${totalTargetMinor},
          ${totalHighMinor}, ${BigInt(input.contingencyMinor)}, ${input.truth},
          ${json(input.scope)}::jsonb, ${json(input.assumptions)}::jsonb,
          ${json(input.sourceReferences)}::jsonb, ${ownerId}, ${input.idempotencyKey}, CURRENT_TIMESTAMP
        )
      `);

      for (const line of input.lines) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "BudgetLine" (
            "id", "budgetVersionId", "roomId", "category", "description",
            "lowMinor", "targetMinor", "highMinor", "truth", "basis", "createdAt"
          ) VALUES (
            ${crypto.randomUUID()}, ${id}, ${line.roomId ?? null}, ${line.category},
            ${line.description ?? null}, ${BigInt(line.lowMinor)}, ${BigInt(line.targetMinor)},
            ${BigInt(line.highMinor)}, ${line.truth}, ${json(line.basis)}::jsonb, CURRENT_TIMESTAMP
          )
        `);
      }

      return { id, planId, version, totalLowMinor, totalTargetMinor, totalHighMinor };
    });
  },

  async lockVersion(propertyId: string, ownerId: string, version: number) {
    return serializable(async (tx) => {
      const plan = await tx.$queryRaw<Array<{ id: string; status: string }>>(Prisma.sql`
        SELECT "id", "status" FROM "BudgetPlan"
        WHERE "propertyId" = ${propertyId} AND "ownerId" = ${ownerId}
        FOR UPDATE
      `);
      if (!plan[0]) return null;
      if (plan[0].status === "LOCKED") return { conflict: true } as const;

      const budget = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "BudgetVersion"
        WHERE "planId" = ${plan[0].id} AND "version" = ${version}
      `);
      if (!budget[0]) return { missing: true } as const;

      await tx.$executeRaw(Prisma.sql`
        UPDATE "BudgetPlan"
        SET "status" = 'LOCKED', "lockedVersion" = ${version},
            "lockedAt" = CURRENT_TIMESTAMP, "lockedByUserId" = ${ownerId},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${plan[0].id}
      `);
      return { locked: true, version } as const;
    });
  },

  async createImpact(propertyId: string, ownerId: string, input: BudgetImpactInput) {
    const plan = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "BudgetPlan"
      WHERE "propertyId" = ${propertyId} AND "ownerId" = ${ownerId}
    `);
    if (!plan[0]) return null;

    const id = crypto.randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "BudgetImpact" (
        "id", "planId", "baseVersion", "proposedLowDeltaMinor",
        "proposedTargetDeltaMinor", "proposedHighDeltaMinor", "reason", "inputs", "createdAt"
      ) VALUES (
        ${id}, ${plan[0].id}, ${input.baseVersion}, ${BigInt(input.proposedLowDeltaMinor)},
        ${BigInt(input.proposedTargetDeltaMinor)}, ${BigInt(input.proposedHighDeltaMinor)},
        ${input.reason}, ${json(input.inputs)}::jsonb, CURRENT_TIMESTAMP
      )
    `);
    return { id, ...input };
  },
};
