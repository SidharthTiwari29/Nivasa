import { calculateTax } from './tax';
export type CostLine = { category: 'product' | 'material' | 'labour' | 'installation' | 'delivery'; quantity: number; unitAmountMinor: number };
export function calculateEstimate(lines: CostLine[], taxRateBps: number) {
  const subtotalMinor = lines.reduce((sum, line) => sum + Math.round(line.quantity * line.unitAmountMinor), 0);
  const taxMinor = calculateTax({ taxableAmountMinor: subtotalMinor, rateBps: taxRateBps });
  return { subtotalMinor, taxMinor, totalMinor: subtotalMinor + taxMinor };
}
