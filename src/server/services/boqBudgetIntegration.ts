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
