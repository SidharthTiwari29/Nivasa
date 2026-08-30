export type DesignBudgetSelection = {
  selectionId: string;
  catalogueItemId?: string;
  description: string;
  quantity: number;
  unitPriceMinor?: number;
  currency: string;
};

export type BudgetImpact = {
  selectionId: string;
  description: string;
  quantity: number;
  unitPriceMinor?: number;
  impactMinor?: number;
  currency: string;
  priceKnown: boolean;
};

const assertPositive = (value: number, field: string): void => {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${field} must be greater than zero`);
};

export const calculateDesignBudgetImpact = (
  selections: DesignBudgetSelection[],
): BudgetImpact[] =>
  selections.map((selection) => {
    assertPositive(selection.quantity, "quantity");
    if (!selection.description.trim())
      throw new Error("description is required");
    if (!selection.currency.trim()) throw new Error("currency is required");
    if (selection.unitPriceMinor !== undefined) {
      if (
        !Number.isInteger(selection.unitPriceMinor) ||
        selection.unitPriceMinor < 0
      ) {
        throw new Error("unitPriceMinor must be a non-negative integer");
      }
    }

    const impactMinor =
      selection.unitPriceMinor === undefined
        ? undefined
        : Math.round(selection.quantity * selection.unitPriceMinor);

    return {
      selectionId: selection.selectionId,
      description: selection.description.trim(),
      quantity: selection.quantity,
      unitPriceMinor: selection.unitPriceMinor,
      impactMinor,
      currency: selection.currency.trim().toUpperCase(),
      priceKnown: selection.unitPriceMinor !== undefined,
    };
  });

export const sumKnownBudgetImpact = (
  impacts: BudgetImpact[],
  currency: string,
): number => {
  const normalizedCurrency = currency.trim().toUpperCase();
  return impacts.reduce((total, impact) => {
    if (
      impact.currency !== normalizedCurrency ||
      impact.impactMinor === undefined
    )
      return total;
    return total + impact.impactMinor;
  }, 0);
};
