export type Money = { amountMinor: number; currency: 'INR' };
export const packagePrices: Record<string, Money> = {
  FREE: { amountMinor: 0, currency: 'INR' },
  NIVASA_DESIGN: { amountMinor: 9900, currency: 'INR' },
  NIVASA_COMPLETE: { amountMinor: 99900, currency: 'INR' },
  NIVASA_PRO: { amountMinor: 999900, currency: 'INR' },
};
export function getConfiguredPackagePrice(code: string): Money | undefined { return packagePrices[code]; }
