export type ProjectChoice = {
  id: string;
  description: string;
  currentPriceMinor: number | null;
  alternativePriceMinor: number | null;
  qualityImpact: "BETTER" | "SIMILAR" | "LOWER" | "UNKNOWN";
  maintenanceImpact: "BETTER" | "SIMILAR" | "HIGHER" | "UNKNOWN";
  evidenceQuality: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
};

export type SavingsOpportunity = {
  id: string;
  description: string;
  savingMinor: number | null;
  decision: "SAVE" | "NEUTRAL" | "COST" | "UNKNOWN";
  qualityImpact: ProjectChoice["qualityImpact"];
  maintenanceImpact: ProjectChoice["maintenanceImpact"];
  confidenceBps: number;
};

type SavingsDecision = SavingsOpportunity["decision"];

const qualityWeight: Record<ProjectChoice["evidenceQuality"], number> = {
  HIGH: 3000,
  MEDIUM: 2000,
  LOW: 1000,
  UNKNOWN: 0,
};

const impactWeight: Record<ProjectChoice["qualityImpact"], number> = {
  BETTER: 1500,
  SIMILAR: 1000,
  LOWER: 500,
  UNKNOWN: 0,
};

export const optimizeProjectSavings = (
  choices: ProjectChoice[],
): SavingsOpportunity[] =>
  choices
    .map((choice): SavingsOpportunity => {
      const savingMinor =
        choice.currentPriceMinor === null ||
        choice.alternativePriceMinor === null
          ? null
          : choice.currentPriceMinor - choice.alternativePriceMinor;
      const decision: SavingsDecision =
        savingMinor === null
          ? "UNKNOWN"
          : savingMinor > 0
            ? "SAVE"
            : savingMinor === 0
              ? "NEUTRAL"
              : "COST";
      const confidenceBps = Math.min(
        10000,
        5000 +
          qualityWeight[choice.evidenceQuality] / 2 +
          impactWeight[choice.qualityImpact] / 2,
      );

      return {
        id: choice.id,
        description: choice.description.trim(),
        savingMinor,
        decision,
        qualityImpact: choice.qualityImpact,
        maintenanceImpact: choice.maintenanceImpact,
        confidenceBps,
      };
    })
    .sort((left, right) => {
      if (left.decision === "UNKNOWN") return 1;
      if (right.decision === "UNKNOWN") return -1;
      return (
        (right.savingMinor ?? Number.NEGATIVE_INFINITY) -
        (left.savingMinor ?? Number.NEGATIVE_INFINITY)
      );
    });
