export type AssistantContext = {
  projectId: string;
  approvedDecisions: string[];
  lockedDecisions: string[];
  budgetMinor?: bigint;
  currentTotalMinor?: bigint;
  locale?: string;
};

export type AssistantAnswer = {
  message: string;
  reasoning: string[];
  tradeOffs: string[];
  affectedDecisionIds: string[];
  confidenceBps: number;
  requiresUserDecision: boolean;
};

export function answerWhatWouldYouDo(
  context: AssistantContext,
  question: string,
): AssistantAnswer {
  const normalized = question.trim().toLowerCase();
  const budgetPressure =
    context.budgetMinor !== undefined &&
    context.currentTotalMinor !== undefined &&
    context.currentTotalMinor > context.budgetMinor;

  if (normalized.includes("budget") || normalized.includes("save")) {
    return {
      message: budgetPressure
        ? "I would protect locked decisions first and look for evidence-backed substitutions in non-protected scope."
        : "I would preserve the decisions that matter most to you and compare alternatives before spending more.",
      reasoning: [
        "Locked decisions are protected from silent changes.",
        "Savings should be based on persisted pricing or explicit estimates.",
      ],
      tradeOffs: ["A cheaper option may change durability, maintenance, appearance or service."],
      affectedDecisionIds: context.lockedDecisions,
      confidenceBps: 9000,
      requiresUserDecision: true,
    };
  }

  return {
    message: "I would keep the home's confirmed spatial constraints and your approved decisions as the baseline, then compare the strongest alternatives before changing anything.",
    reasoning: [
      "The actual home is the source of truth where information is confirmed.",
      "Recommendations should explain evidence and trade-offs rather than silently deciding for you.",
    ],
    tradeOffs: ["Any inferred dimension, price or compatibility claim should remain explicitly uncertain until verified."],
    affectedDecisionIds: context.approvedDecisions,
    confidenceBps: 8500,
    requiresUserDecision: true,
  };
}
