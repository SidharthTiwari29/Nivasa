export type TaxInput = { taxableAmountMinor: number; rateBps: number };
export function calculateTax({ taxableAmountMinor, rateBps }: TaxInput): number {
  if (taxableAmountMinor < 0 || rateBps < 0) throw new Error('INVALID_TAX_INPUT');
  return Math.round((taxableAmountMinor * rateBps) / 10_000);
}
