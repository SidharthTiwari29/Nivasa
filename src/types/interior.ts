export type LightingMode = "morning" | "evening";

export type MaterialTier = "standard" | "recommended" | "premium";

export type MaterialOption = {
  id: string;
  categoryId: string;
  name: string;
  tier: MaterialTier;
  priceMinor: number;
  specSummary: string;
  reasonText: string;
};

export type MaterialCategory = {
  id: string;
  label: string;
  specifications: string[];
  options: MaterialOption[];
};

export type SmartFind = {
  id: string;
  categoryId: string;
  currentOptionId: string;
  currentPriceMinor: number;
  alternativeOptionId: string;
  alternativeLabel: string;
  alternativePriceMinor: number;
};

export type SpatialHotspot = {
  id: string;
  label: string;
  areaSqFt: number;
  position: [number, number, number];
};

export type NanoBananaDetection = {
  id: string;
  label: string;
};

export type HumsafarNudge = {
  id: string;
  text: string;
  tone: "info" | "positive" | "warning";
};

export type SceneId =
  | "entrance"
  | "spatial"
  | "materials"
  | "transparency"
  | "motion"
  | "finds"
  | "moments"
  | "budget"
  | "humsafar";
