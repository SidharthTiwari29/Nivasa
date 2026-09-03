import {
  deriveMeritsAndDemerits,
  type ProductMerits,
} from "@/server/services/productMerits";

type PriceLike = {
  warrantyMonths: number | null;
  mrpMinor: bigint | null;
  amountMinor: bigint;
  effectiveFrom: Date;
  verifiedAt: Date | null;
  availability: "IN_STOCK" | "LIMITED_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
};

// Kept outside the page component on purpose: computing the real
// price age from the current time is a genuinely impure operation
// (Date.now()), which React's purity rules correctly flag when called
// directly inside a component's render body. Isolating it here keeps
// the component itself a pure function of its props/params.
export function getItemMerits(
  price: PriceLike,
  alternativesConsidered: number,
): ProductMerits {
  const priceAgeDays = Math.floor(
    (Date.now() - price.effectiveFrom.getTime()) / 86_400_000,
  );
  return deriveMeritsAndDemerits({
    warrantyMonths: price.warrantyMonths,
    mrpMinor: price.mrpMinor,
    unitPriceMinor: price.amountMinor,
    priceAgeDays,
    verifiedAt: price.verifiedAt,
    availability: price.availability,
    alternativesConsidered,
  });
}
