import { CostLine, calculateEstimate } from '@/server/costing/estimate';
export type BoqItemInput = CostLine & { sourceId: string; description: string };
export function buildBoqSnapshot(items: BoqItemInput[], taxRateBps: number, pricingVersion: string) {
  return { pricingVersion, items, totals: calculateEstimate(items, taxRateBps), generatedAt: new Date().toISOString() };
}
