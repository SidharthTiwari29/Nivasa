import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { catalogueBargainRepository } from "@/server/repositories/catalogueBargainRepository";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { evaluateCatalogueBargain } from "@/server/services/catalogueBargain";

export type BargainOutcome =
  | { decision: "ACCEPTED"; reason: string; newUnitPriceMinor: bigint }
  | { decision: "REJECTED"; reason: string; alternative: null }
  | {
      decision: "REJECTED";
      reason: string;
      alternative: {
        itemId: string;
        name: string;
        brand: string | null;
        unitPriceMinor: bigint;
      };
    };

export const catalogueBargainService = {
  // The real win-win: evaluateCatalogueBargain never lowers a price
  // below the item's own real, current, zero-margin floor - that
  // guarantee is the business's win, and it never changes here. But a
  // flat rejection is not a win for the customer at all. When a proposal
  // is genuinely below what THIS item can honor, this searches the same
  // real category for a genuinely cheaper active alternative that
  // already meets or beats their proposed price - if one exists, the
  // customer walks away with a real, purchasable product at their
  // budget instead of just "no." No fabrication either way: the
  // alternative offered is always a real, currently-priced catalogue
  // item, never invented to make the rejection feel better.
  async proposePrice(
    boqLineId: string,
    ownerId: string,
    proposedPriceMinor: bigint,
  ): Promise<BargainOutcome> {
    const line = await catalogueBargainRepository.findLineForOwner(
      boqLineId,
      ownerId,
    );
    if (!line) throw new NotFoundError("BoqLine");
    if (!line.catalogueItemId || !line.catalogueItem) {
      throw new ConflictError(
        "This line item is not linked to a catalogue product - nothing to bargain against",
      );
    }
    const currentPrice = line.catalogueItem.prices[0];
    if (!currentPrice) {
      throw new ConflictError("This item has no real current price on record");
    }

    const result = evaluateCatalogueBargain(
      {
        unitPriceMinor: currentPrice.amountMinor,
        mrpMinor: currentPrice.mrpMinor,
      },
      proposedPriceMinor,
    );

    if (result.decision === "ACCEPTED") {
      // The customer's offer already meets the real, current price -
      // applying it here is a no-op in value terms, but it's the real
      // confirmation action, not a silent pass-through: the line is
      // (re)written with the exact current real price, matching the
      // same formula used everywhere else in this codebase
      // (quantity * unitPrice + material + labour), never a different,
      // parallel calculation.
      const quantity = BigInt(line.quantity.toString());
      const newLineTotalMinor =
        quantity * currentPrice.amountMinor +
        line.materialMinor +
        line.labourMinor;
      await catalogueBargainRepository.updateLinePrice(
        boqLineId,
        currentPrice.amountMinor,
        newLineTotalMinor,
      );
      return {
        decision: "ACCEPTED",
        reason: result.reason,
        newUnitPriceMinor: currentPrice.amountMinor,
      };
    }

    // Rejected - look for a real, genuinely cheaper alternative in the
    // same category before returning a bare "no."
    const optionsByCategory =
      await catalogueCurationRepository.findActiveOptionsByCategories([
        line.catalogueItem.category,
      ]);
    const options = optionsByCategory.get(line.catalogueItem.category) ?? [];
    const matchingAlternative = options
      .filter(
        (o) =>
          o.itemId !== line.catalogueItemId &&
          o.unitPriceMinor <= proposedPriceMinor,
      )
      .reduce<(typeof options)[number] | null>(
        (cheapest, option) =>
          cheapest === null || option.unitPriceMinor < cheapest.unitPriceMinor
            ? option
            : cheapest,
        null,
      );

    if (matchingAlternative) {
      return {
        decision: "REJECTED",
        reason: result.reason,
        alternative: {
          itemId: matchingAlternative.itemId,
          name: matchingAlternative.name,
          brand: matchingAlternative.brand,
          unitPriceMinor: matchingAlternative.unitPriceMinor,
        },
      };
    }

    return { decision: "REJECTED", reason: result.reason, alternative: null };
  },
};
