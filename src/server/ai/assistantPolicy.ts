export type AssistantIntent = "EXPLAIN" | "COMPARE" | "WHAT_IF" | "BUILD_CHECK" | "PROCUREMENT" | "WALKTHROUGH";

export interface AssistantRequest { intent: AssistantIntent; propertyId: string; input: string; language: string; }
export interface AssistantDecision { allowed: boolean; requiresEvidence: boolean; requiresHumanApproval: boolean; }

export function authorizeAssistantAction(request: AssistantRequest): AssistantDecision {
  if (!request.propertyId.trim() || !request.input.trim()) throw new Error("assistant request is incomplete");
  if (request.intent === "PROCUREMENT") return { allowed: true, requiresEvidence: true, requiresHumanApproval: true };
  if (request.intent === "WHAT_IF" || request.intent === "BUILD_CHECK") return { allowed: true, requiresEvidence: true, requiresHumanApproval: false };
  if (request.intent === "WALKTHROUGH") return { allowed: true, requiresEvidence: true, requiresHumanApproval: false };
  return { allowed: true, requiresEvidence: false, requiresHumanApproval: false };
}
