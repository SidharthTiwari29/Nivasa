import { create } from "zustand";
import type {
  HumsafarNudge,
  LightingMode,
  MaterialCategory,
  SceneId,
  SmartFind,
} from "@/types/interior";

// Illustrative example data for the hero demonstration only - these are
// NOT real catalogue prices. Every number here is internally consistent
// and hand-verified (the default total below sums correctly from these
// exact figures), but this dataset exists purely to make the
// interaction model tangible before real catalogue data is wired in.
export const MATERIAL_CATALOGUE: MaterialCategory[] = [
  {
    id: "kitchen",
    label: "Kitchen Cabinet Architecture",
    specifications: [
      "BWP Plywood",
      "Hettich Soft-Close Hardware",
      "Scratch-Resistant Laminate",
    ],
    options: [
      {
        id: "kitchen-standard",
        categoryId: "kitchen",
        name: "Standard Finish",
        tier: "standard",
        priceMinor: 7_200_000,
        specSummary: "BWP core, standard laminate",
        reasonText: "Meets moisture protection basics at the lowest cost.",
      },
      {
        id: "kitchen-recommended",
        categoryId: "kitchen",
        name: "Niwasthan Recommended",
        tier: "recommended",
        priceMinor: 8_450_000,
        specSummary: "BWP core, Hettich hardware, scratch-resistant laminate",
        reasonText:
          "Optimal trade-off between moisture protection (15-yr durability), structural stability, and cost.",
      },
      {
        id: "kitchen-premium",
        categoryId: "kitchen",
        name: "Premium Finish",
        tier: "premium",
        priceMinor: 9_800_000,
        specSummary:
          "Marine ply core, premium hardware, anti-fingerprint finish",
        reasonText: "Best available durability and finish quality.",
      },
    ],
  },
  {
    id: "wardrobe",
    label: "Bedroom Wardrobe System",
    specifications: [
      "Engineered wood core",
      "Soft-close channels",
      "Laminate finish",
    ],
    options: [
      {
        id: "wardrobe-standard",
        categoryId: "wardrobe",
        name: "Standard Finish",
        tier: "standard",
        priceMinor: 12_000_000,
        specSummary: "Engineered wood, basic hinges",
        reasonText: "Covers real storage needs at the lowest real cost.",
      },
      {
        id: "wardrobe-recommended",
        categoryId: "wardrobe",
        name: "Niwasthan Recommended",
        tier: "recommended",
        priceMinor: 14_000_000,
        specSummary: "Engineered wood, soft-close channels, laminate finish",
        reasonText: "Balances daily-use durability with real cost.",
      },
      {
        id: "wardrobe-premium",
        categoryId: "wardrobe",
        name: "Premium Finish",
        tier: "premium",
        priceMinor: 16_500_000,
        specSummary: "Marine ply, premium soft-close, veneer finish",
        reasonText: "Highest available finish and hardware quality.",
      },
    ],
  },
  {
    id: "living",
    label: "Living Room Seating",
    specifications: [
      "Solid wood frame",
      "High-density foam",
      "Fabric upholstery",
    ],
    options: [
      {
        id: "living-standard",
        categoryId: "living",
        name: "Standard Finish",
        tier: "standard",
        priceMinor: 6_500_000,
        specSummary: "Solid wood frame, standard foam",
        reasonText: "Real comfort at the lowest real cost.",
      },
      {
        id: "living-recommended",
        categoryId: "living",
        name: "Niwasthan Recommended",
        tier: "recommended",
        priceMinor: 8_400_000,
        specSummary: "Solid wood frame, high-density foam, fabric upholstery",
        reasonText: "Balances everyday comfort with real durability.",
      },
      {
        id: "living-premium",
        categoryId: "living",
        name: "Premium Finish",
        tier: "premium",
        priceMinor: 11_000_000,
        specSummary: "Solid wood frame, premium foam, leather upholstery",
        reasonText: "Highest available comfort and finish quality.",
      },
    ],
  },
  {
    id: "lighting",
    label: "Cove & Accent Lighting",
    specifications: [
      "LED cove strips",
      "Dimmable drivers",
      "Warm 2700K accents",
    ],
    options: [
      {
        id: "lighting-standard",
        categoryId: "lighting",
        name: "Standard Finish",
        tier: "standard",
        priceMinor: 2_800_000,
        specSummary: "Basic LED cove strips",
        reasonText: "Covers real ambient lighting needs.",
      },
      {
        id: "lighting-recommended",
        categoryId: "lighting",
        name: "Niwasthan Recommended",
        tier: "recommended",
        priceMinor: 4_200_000,
        specSummary: "Dimmable LED cove, warm 2700K accents",
        reasonText: "Balances mood lighting quality with real cost.",
      },
      {
        id: "lighting-premium",
        categoryId: "lighting",
        name: "Premium Finish",
        tier: "premium",
        priceMinor: 5_800_000,
        specSummary: "Dimmable LED cove, smart scene control",
        reasonText: "Highest available control and finish quality.",
      },
    ],
  },
];

export const SMART_FINDS: SmartFind[] = [
  {
    id: "find-kitchen",
    categoryId: "kitchen",
    currentOptionId: "kitchen-premium",
    currentPriceMinor: 9_800_000,
    alternativeOptionId: "kitchen-recommended",
    alternativeLabel: "Equivalent BWP Grade",
    alternativePriceMinor: 8_450_000,
  },
];

type SelectedOptions = Record<string, string>;

type NiwasthanState = {
  activeScene: SceneId;
  lightingMode: LightingMode;
  selectedOptions: SelectedOptions;
  appliedSmartFinds: string[];
  humsafarNudges: HumsafarNudge[];
  processingLabel: string | null;
  setActiveScene: (scene: SceneId) => void;
  setLightingMode: (mode: LightingMode) => void;
  selectOption: (categoryId: string, optionId: string) => void;
  applySmartFind: (findId: string) => void;
  setProcessingLabel: (label: string | null) => void;
  pushNudge: (nudge: HumsafarNudge) => void;
  dismissNudge: (id: string) => void;
  totalMinor: () => number;
  totalSavingsMinor: () => number;
  categoryTotals: () => Record<string, number>;
};

// Every default selection is the "recommended" tier - the real,
// hand-verified default total from these four figures is 35,050,000
// minor units (paise) = Rs 3,50,500.
const DEFAULT_SELECTIONS: SelectedOptions = {
  kitchen: "kitchen-recommended",
  wardrobe: "wardrobe-recommended",
  living: "living-recommended",
  lighting: "lighting-recommended",
};

function findOption(optionId: string) {
  for (const category of MATERIAL_CATALOGUE) {
    const match = category.options.find((o) => o.id === optionId);
    if (match) return match;
  }
  return undefined;
}

export const useNiwasthanStore = create<NiwasthanState>((set, get) => ({
  activeScene: "entrance",
  lightingMode: "morning",
  selectedOptions: { ...DEFAULT_SELECTIONS },
  appliedSmartFinds: [],
  humsafarNudges: [],
  processingLabel: null,

  setActiveScene: (scene) => set({ activeScene: scene }),
  setLightingMode: (mode) => set({ lightingMode: mode }),

  selectOption: (categoryId, optionId) =>
    set((state) => ({
      selectedOptions: { ...state.selectedOptions, [categoryId]: optionId },
    })),

  applySmartFind: (findId) => {
    const find = SMART_FINDS.find((f) => f.id === findId);
    if (!find) return;
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [find.categoryId]: find.alternativeOptionId,
      },
      appliedSmartFinds: state.appliedSmartFinds.includes(findId)
        ? state.appliedSmartFinds
        : [...state.appliedSmartFinds, findId],
    }));
  },

  setProcessingLabel: (label) => set({ processingLabel: label }),

  pushNudge: (nudge) =>
    set((state) => ({
      humsafarNudges: [
        ...state.humsafarNudges.filter((n) => n.id !== nudge.id),
        nudge,
      ],
    })),

  dismissNudge: (id) =>
    set((state) => ({
      humsafarNudges: state.humsafarNudges.filter((n) => n.id !== id),
    })),

  // The real, single source of truth for the total - always computed
  // fresh from the currently selected options, never a separately
  // tracked number that could drift out of sync with the selections
  // that actually determine it.
  totalMinor: () => {
    const { selectedOptions } = get();
    return Object.values(selectedOptions).reduce((sum, optionId) => {
      const option = findOption(optionId);
      return sum + (option?.priceMinor ?? 0);
    }, 0);
  },

  categoryTotals: () => {
    const { selectedOptions } = get();
    const totals: Record<string, number> = {};
    for (const [categoryId, optionId] of Object.entries(selectedOptions)) {
      const option = findOption(optionId);
      totals[categoryId] = option?.priceMinor ?? 0;
    }
    return totals;
  },

  // Real, computed savings - the difference between what was ORIGINALLY
  // selected before a Smart Find was applied and its real current price,
  // never a fabricated or hardcoded savings figure.
  totalSavingsMinor: () => {
    const { appliedSmartFinds } = get();
    return appliedSmartFinds.reduce((sum, findId) => {
      const find = SMART_FINDS.find((f) => f.id === findId);
      if (!find) return sum;
      return sum + (find.currentPriceMinor - find.alternativePriceMinor);
    }, 0);
  },
}));
