import type { DomainEvent } from "./notificationBridge";
import type { ExecutionStage } from "./executionPlan";

export function domainEventForExecutionStage(
  stage: ExecutionStage,
  message?: string,
): DomainEvent | null {
  if (stage === "QUOTE_RECEIVED")
    return { type: "QUOTE_RECEIVED", item: message ?? "your project" };
  if (stage === "INSTALLATION")
    return {
      type: "INSTALLATION_UPDATE",
      message: message ?? "installation has started",
    };
  return null;
}
