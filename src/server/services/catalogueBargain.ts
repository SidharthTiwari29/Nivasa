export type BargainDecision = "ACCEPTED" | "REJECTED";

export type BargainResult = {
  decision: BargainDecision;
  reason: string;
};

// Direct implementation of the real business rule: since catalogue items
// carry zero margin (see catalogueCuration.ts's zero-margin guarantee),
// there is no commission buffer to negotiate against, unlike procurement/
// labour quotes (negotiationEngine.ts). The only honest basis for
// accepting a lower price is a REAL, already-existing discount from the
// brand's own MRP - never a fabricated allowance.
//
// - No standing discount (mrpMinor missing, or mrpMinor <= unitPriceMinor):
//   the item is already at floor price with nothing behind it to concede -
//   every proposal is rejected outright, regardless of amount.
// - A real standing discount exists (mrpMinor > unitPriceMinor): the
//   already-discounted unitPriceMinor is the real floor - we will not go
//   below it (that would mean selling below the real, current cost with
//   zero margin to absorb it), but a proposal at or above that floor is
//   accepted, since the customer is asking for a price we can genuinely
//   honor.
export function evaluateCatalogueBargain(
  item: { unitPriceMinor: bigint; mrpMinor: bigint | null },
  proposedPriceMinor: bigint,
): BargainResult {
  const hasStandingDiscount =
    item.mrpMinor !== null && item.mrpMinor > item.unitPriceMinor;

  if (!hasStandingDiscount) {
    return {
      decision: "REJECTED",
      reason:
        "This item has no standing brand discount on record - the listed price is already the floor, with no room to concede further",
    };
  }

  if (proposedPriceMinor >= item.unitPriceMinor) {
    return {
      decision: "ACCEPTED",
      reason:
        "A real brand discount already applies to this item, and your offer meets our current discounted price",
    };
  }

  return {
    decision: "REJECTED",
    reason:
      "Even with a standing brand discount, we cannot go below our current listed price - it is already at zero margin",
  };
}
