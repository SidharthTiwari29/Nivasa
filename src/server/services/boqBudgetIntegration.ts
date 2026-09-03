import { prisma } from "@/server/db/prisma";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { NotFoundError } from "@/server/errors/AppError";

export type BoqBudgetDelta = {
  lowDeltaMinor: bigint;
  targetDeltaMinor: bigint;
  highDeltaMinor: bigint;
};

/**
 * Reconciles a deterministic BOQ point total against the budget target.
 * BOQ is a concrete costing projection, so the same delta is used for the
 * three budget bands rather than fabricating a range that the BOQ does not
 * contain.
 */
export const calculateBoqBudgetDelta = (
  boqTotalMinor: bigint,
  budgetTargetMinor: bigint,
): BoqBudgetDelta => {
  const delta = boqTotalMinor - budgetTargetMinor;
  return {
    lowDeltaMinor: delta,
    targetDeltaMinor: delta,
    highDeltaMinor: delta,
  };
};

export const toSafeSignedMinorMoney = (value: bigint): number => {
  const numeric = Number(value);
  if (!Number.isSafeInteger(numeric)) {
    throw new Error("MINOR_MONEY_OUT_OF_SAFE_NUMBER_RANGE");
  }
  return numeric;
};

/**
 * Reconciles a persisted BOQ version with the latest owner-scoped budget
 * version. The budget remains the system of record for the user's target;
 * the BOQ contributes a deterministic point estimate and an auditable impact
 * record. No range is invented when the BOQ only contains a point total.
 */
export const reconcileBoqWithBudget = async (input: {
  ownerId: string;
  projectId: string;
  boqVersion: number;
}) => {
  const boq = await prisma.boq.findFirst({
    where: {
      version: input.boqVersion,
      projectId: input.projectId,
      project: { ownerId: input.ownerId },
    },
    select: {
      id: true,
      version: true,
      totalMinor: true,
      project: { select: { propertyId: true } },
    },
  });
  if (!boq) throw new NotFoundError("Boq");

  const budget = await budgetRepository.findPlan(
    boq.project.propertyId,
    input.ownerId,
  );
  const baseVersion = budget?.versions[0];
  if (!baseVersion) throw new NotFoundError("BudgetVersion");

  const delta = calculateBoqBudgetDelta(
    boq.totalMinor,
    baseVersion.totalTargetMinor,
  );

  return budgetRepository.createImpact(boq.project.propertyId, input.ownerId, {
    baseVersion: baseVersion.version,
    proposedLowDeltaMinor: toSafeSignedMinorMoney(delta.lowDeltaMinor),
    proposedTargetDeltaMinor: toSafeSignedMinorMoney(delta.targetDeltaMinor),
    proposedHighDeltaMinor: toSafeSignedMinorMoney(delta.highDeltaMinor),
    reason: `BOQ v${boq.version} reconciliation against budget v${baseVersion.version}`,
    inputs: {
      source: "BOQ",
      boqId: boq.id,
      boqVersion: boq.version,
      boqTotalMinor: boq.totalMinor.toString(),
      budgetTargetMinor: baseVersion.totalTargetMinor.toString(),
    },
  });
};
