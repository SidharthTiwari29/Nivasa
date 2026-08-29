import type { MarketCategory, MarketSourceDefinition } from "./sourceRegistry";
import type { RawMarketRecord } from "./ingestion";

export interface SourceAdapterContext {
  source: MarketSourceDefinition;
  requestedAt: Date;
  geography?: string;
  cursor?: string;
}

export interface SourceAdapterPage {
  records: RawMarketRecord[];
  nextCursor?: string;
}

export interface MarketSourceAdapter {
  readonly sourceKey: string;
  readonly supportedCategories: readonly MarketCategory[];
  fetchPage(context: SourceAdapterContext): Promise<SourceAdapterPage>;
}

export class SourceAdapterRegistry {
  private readonly adapters = new Map<string, MarketSourceAdapter>();

  register(adapter: MarketSourceAdapter): void {
    if (this.adapters.has(adapter.sourceKey)) {
      throw new Error(
        `Market source adapter already registered: ${adapter.sourceKey}`,
      );
    }
    this.adapters.set(adapter.sourceKey, adapter);
  }

  resolve(source: MarketSourceDefinition): MarketSourceAdapter {
    if (!source.ingestionEligible) {
      throw new Error(`Market source is not ingestion eligible: ${source.key}`);
    }

    const adapter = this.adapters.get(source.key);
    if (!adapter) {
      throw new Error(`No adapter registered for market source: ${source.key}`);
    }
    return adapter;
  }
}
