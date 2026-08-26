export interface QuoteLineInput { catalogueItemId: string; quantity: number; unitPriceMinor: bigint; evidenceId: string; }
export interface QuoteInput { supplierId: string; lines: readonly QuoteLineInput[]; validUntil: Date; }
export interface QuoteValidation { valid: boolean; errors: string[]; totalMinor: bigint; }

export function validateQuote(quote: QuoteInput, now = new Date()): QuoteValidation {
  const errors: string[] = [];
  if (!quote.supplierId.trim()) errors.push("SUPPLIER_REQUIRED");
  if (quote.lines.length === 0) errors.push("LINES_REQUIRED");
  if (quote.validUntil.getTime() <= now.getTime()) errors.push("QUOTE_EXPIRED");
  let totalMinor = 0n;
  for (const [index, line] of quote.lines.entries()) {
    if (!line.catalogueItemId.trim()) errors.push(`LINE_${index}_ITEM_REQUIRED`);
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) errors.push(`LINE_${index}_QUANTITY_INVALID`);
    if (line.unitPriceMinor < 0n) errors.push(`LINE_${index}_PRICE_INVALID`);
    if (!line.evidenceId.trim()) errors.push(`LINE_${index}_EVIDENCE_REQUIRED`);
    totalMinor += line.unitPriceMinor * BigInt(Math.round(line.quantity));
  }
  return { valid: errors.length === 0, errors, totalMinor };
}
