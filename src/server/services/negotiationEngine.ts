export type NegotiationDecision = "ACCEPTED" | "COUNTERED" | "REJECTED";

export type NegotiationResult = {
  decision: NegotiationDecision;
  counterAmountMinor: bigint | null;
  reason: string;
};

const BPS_DENOMINATOR = 10_000n;

// The actual profit-protection mechanism: a Quote's totalAmountMinor
// implicitly contains Nivasa's commission (nivasaCommissionBps of the
// total). minMarginBps is the floor percentage of the total that must
// remain as margin no matter what a user negotiates down to - so a
// proposal is evaluated against a computed floor price, not against an
// arbitrary "don't go below X rupees" rule that could be miscalculated
// per-quote.
//
// floorAmountMinor = totalAmountMinor * (1 - (nivasaCommissionBps -
// minMarginBps) / 10000)
//
// In plain terms: Nivasa can give up commission down to its minimum
// margin floor, but never below it. If a user proposes at or above the
// floor, the negotiation is accepted immediately (no back-and-forth
// needed since the business's minimum requirement is already met). If
// they propose below the floor, the floor itself becomes the counter-offer
// - the most Nivasa can concede, stated plainly rather than just
// rejecting with no path forward.
export function evaluateNegotiation(
  quote: {
    totalAmountMinor: bigint;
    nivasaCommissionBps: number;
    minMarginBps: number;
  },
  proposedAmountMinor: bigint,
): NegotiationResult {
  if (proposedAmountMinor <= 0n) {
    return {
      decision: "REJECTED",
      counterAmountMinor: null,
      reason: "Proposed amount must be a positive value",
    };
  }

  if (proposedAmountMinor >= quote.totalAmountMinor) {
    return {
      decision: "REJECTED",
      counterAmountMinor: null,
      reason: "Proposed amount is not lower than the current quote total",
    };
  }

  const maxConcessionBps = BigInt(
    Math.max(quote.nivasaCommissionBps - quote.minMarginBps, 0),
  );
  const floorAmountMinor =
    quote.totalAmountMinor -
    (quote.totalAmountMinor * maxConcessionBps) / BPS_DENOMINATOR;

  if (proposedAmountMinor >= floorAmountMinor) {
    return {
      decision: "ACCEPTED",
      counterAmountMinor: null,
      reason:
        "Proposed amount meets Nivasa's minimum margin requirement for this quote",
    };
  }

  return {
    decision: "COUNTERED",
    counterAmountMinor: floorAmountMinor,
    reason:
      "Proposed amount is below the minimum margin floor - countered with the lowest price Nivasa can accept",
  };
}
