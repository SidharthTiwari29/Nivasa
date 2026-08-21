export type CostLine = {
  quantity: bigint;
  unitPriceMinor: bigint;
  materialMinor?: bigint;
  labourMinor?: bigint;
  taxRateBps?: bigint;
  wastageBps?: bigint;
  discountMinor?: bigint;
};
export type CostTotals = {
  subtotalMinor: bigint;
  wastageMinor: bigint;
  taxMinor: bigint;
  discountMinor: bigint;
  totalMinor: bigint;
};

export function calculateCost(lines: CostLine[]): CostTotals {
  let subtotalMinor = 0n;
  let wastageMinor = 0n;
  let taxMinor = 0n;
  let discountMinor = 0n;
  for (const line of lines) {
    if (line.quantity < 0n || line.unitPriceMinor < 0n)
      throw new Error("INVALID_COST_LINE");
    const base =
      line.quantity * line.unitPriceMinor +
      (line.materialMinor ?? 0n) +
      (line.labourMinor ?? 0n);
    const wastage = (base * (line.wastageBps ?? 0n) + 5000n) / 10000n;
    const discount = line.discountMinor ?? 0n;
    const taxable = base + wastage - discount;
    const tax =
      taxable > 0n ? (taxable * (line.taxRateBps ?? 0n) + 5000n) / 10000n : 0n;
    subtotalMinor += base;
    wastageMinor += wastage;
    discountMinor += discount;
    taxMinor += tax;
  }
  return {
    subtotalMinor,
    wastageMinor,
    taxMinor,
    discountMinor,
    totalMinor: subtotalMinor + wastageMinor + taxMinor - discountMinor,
  };
}
