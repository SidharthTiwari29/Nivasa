import { MINIMUM_ADEQUATE_OPTIONS } from "@/server/services/marketQualityGate";

export type ProductMeritsInput = {
  warrantyMonths: number | null;
  mrpMinor: bigint | null;
  unitPriceMinor: bigint;
  priceAgeDays: number;
  verifiedAt: Date | null;
  availability: "IN_STOCK" | "LIMITED_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  alternativesConsidered: number;
};

export type ProductMerits = {
  merits: string[];
  demerits: string[];
};

const STALE_PRICE_THRESHOLD_DAYS = 30;

// The real, transparent "merit and demerit" analysis - every single
// bullet below is derived directly from a genuine, already-real,
// structured fact this system holds about the specific listing. This
// deliberately excludes any subjective quality/durability/style
// judgment ("premium feel," "durable build") that isn't backed by real
// evidence - the same "no fabricated certainty" discipline applied
// everywhere else in this project, applied here to the one place a
// fabricated claim would be most tempting (a product listing customers
// actually decide on). If a future real data source provides genuine
// lab-tested durability scores or verified return-rate data, THAT would
// be a legitimate merit/demerit input - a subjective rating invented to
// fill this function's output would not be.
export function deriveMeritsAndDemerits(
  input: ProductMeritsInput,
): ProductMerits {
  const merits: string[] = [];
  const demerits: string[] = [];

  if (input.verifiedAt !== null) {
    merits.push(
      `Verified by Niwasthan on ${input.verifiedAt.toISOString().slice(0, 10)}`,
    );
  } else {
    demerits.push("Not yet verified by Niwasthan");
  }

  if (input.warrantyMonths !== null && input.warrantyMonths > 0) {
    merits.push(`Covered by a ${input.warrantyMonths}-month warranty`);
  } else if (input.warrantyMonths === 0) {
    demerits.push("No manufacturer warranty on record");
  } else {
    demerits.push("Warranty coverage not yet confirmed");
  }

  if (input.mrpMinor !== null && input.mrpMinor > input.unitPriceMinor) {
    const savingMinor = input.mrpMinor - input.unitPriceMinor;
    merits.push(
      `Currently discounted ₹${(savingMinor / 100n).toString()} below MRP`,
    );
  }

  if (input.availability === "IN_STOCK") {
    merits.push("In stock");
  } else if (input.availability === "LIMITED_STOCK") {
    demerits.push("Limited stock remaining");
  } else if (input.availability === "OUT_OF_STOCK") {
    demerits.push("Currently out of stock");
  }
  // UNKNOWN availability is deliberately neither a merit nor a demerit -
  // asserting either would be a claim this system cannot actually back.

  if (input.alternativesConsidered >= MINIMUM_ADEQUATE_OPTIONS) {
    merits.push(
      `Compared against ${input.alternativesConsidered - 1} other real option${input.alternativesConsidered - 1 === 1 ? "" : "s"} in this category`,
    );
  } else {
    demerits.push("Only option currently available in this category");
  }

  if (input.priceAgeDays > STALE_PRICE_THRESHOLD_DAYS) {
    demerits.push(`Price last confirmed ${input.priceAgeDays} days ago`);
  }

  return { merits, demerits };
}
