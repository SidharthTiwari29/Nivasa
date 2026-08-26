export interface QuoteLine {
  catalogueItemId: string;
  quantity: number;
  unitPriceMinor: bigint;
}

export interface SupplierQuote {
  id: string;
  supplierId: string;
  currency: string;
  expiresAt: Date;
  lines: readonly QuoteLine[];
}

export interface QuoteTotal { subtotalMinor: bigint; currency: string }

export function calculateQuoteTotal(quote: SupplierQuote, now = new Date()): QuoteTotal {
  if (!quote.supplierId.trim()) throw new Error("supplier is required");
  if (quote.expiresAt.getTime() < now.getTime()) throw new Error("quote expired");
  if (!quote.lines.length) throw new Error("quote has no lines");
  const subtotalMinor = quote.lines.reduce((sum, line) => {
    if (!line.catalogueItemId.trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || line.unitPriceMinor < 0n) {
      throw new Error("invalid quote line");
    }
    return sum + BigInt(line.quantity) * line.unitPriceMinor;
  }, 0n);
  return { subtotalMinor, currency: quote.currency };
}
