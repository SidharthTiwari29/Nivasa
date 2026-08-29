import type { MarketCategory } from "./sourceRegistry";

export interface ProductIdentityCandidate {
  sourceKey: string;
  externalId: string;
  sku?: string;
  brand?: string;
  name: string;
  category: MarketCategory;
  attributes: Record<string, string | number | boolean>;
}

export type ProductMatchKind =
  | "EXACT_SOURCE"
  | "EXACT_SKU"
  | "EQUIVALENT"
  | "NO_MATCH";

export interface ProductMatch {
  kind: ProductMatchKind;
  confidenceBps: number;
  reason: string;
}

const normalize = (value: string | undefined): string =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ") ?? "";

const materialIdentityKeys = [
  "material",
  "finish",
  "colour",
  "color",
  "size",
  "capacity",
  "model",
  "configuration",
];

const comparableAttributes = (
  candidate: ProductIdentityCandidate,
): Record<string, string> =>
  Object.fromEntries(
    materialIdentityKeys
      .map(
        (key) =>
          [key, normalize(String(candidate.attributes[key] ?? ""))] as const,
      )
      .filter(([, value]) => value.length > 0),
  );

export const matchProducts = (
  left: ProductIdentityCandidate,
  right: ProductIdentityCandidate,
): ProductMatch => {
  if (
    left.sourceKey === right.sourceKey &&
    left.externalId === right.externalId
  ) {
    return {
      kind: "EXACT_SOURCE",
      confidenceBps: 10000,
      reason: "Same source identity",
    };
  }

  if (
    left.sku &&
    right.sku &&
    normalize(left.sku) === normalize(right.sku) &&
    normalize(left.brand) === normalize(right.brand) &&
    left.category === right.category
  ) {
    return {
      kind: "EXACT_SKU",
      confidenceBps: 9950,
      reason: "Same SKU, brand and category",
    };
  }

  if (left.category !== right.category) {
    return {
      kind: "NO_MATCH",
      confidenceBps: 0,
      reason: "Different canonical categories",
    };
  }

  const leftName = normalize(left.name);
  const rightName = normalize(right.name);
  const leftAttrs = comparableAttributes(left);
  const rightAttrs = comparableAttributes(right);
  const sharedKeys = Object.keys(leftAttrs).filter(
    (key) => key in rightAttrs,
  );
  const sameAttributes =
    sharedKeys.length > 0 &&
    sharedKeys.every((key) => leftAttrs[key] === rightAttrs[key]);
  const sameBrand =
    normalize(left.brand) !== "" &&
    normalize(left.brand) === normalize(right.brand);
  const sameName = leftName !== "" && leftName === rightName;

  if (sameBrand && sameName && sameAttributes) {
    return {
      kind: "EQUIVALENT",
      confidenceBps: 9200,
      reason: "Same brand/name/category with matching material attributes",
    };
  }

  return {
    kind: "NO_MATCH",
    confidenceBps: 0,
    reason: "Insufficient evidence for equivalence",
  };
};

export const buildAlternativeRelationship = (
  left: ProductIdentityCandidate,
  right: ProductIdentityCandidate,
): ProductMatch => {
  const match = matchProducts(left, right);
  if (match.kind === "EXACT_SOURCE" || match.kind === "EXACT_SKU") {
    return match;
  }
  if (match.kind === "EQUIVALENT") {
    return {
      ...match,
      reason: `${match.reason}; alternative relationship requires persisted evidence`,
    };
  }
  return match;
};
