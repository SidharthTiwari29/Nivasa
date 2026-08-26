import type { NotificationEvent } from "../localization/notificationPolicy";

export type DomainEvent =
  | { type: "PRICE_DROP"; item: string; saving: number }
  | { type: "BUDGET_SAVING"; saving: number }
  | { type: "BUILD_BLOCKER"; message: string }
  | { type: "QUOTE_RECEIVED"; item: string }
  | { type: "INSTALLATION_UPDATE"; message: string };

export function notificationEventFromDomainEvent(
  event: DomainEvent,
): NotificationEvent {
  switch (event.type) {
    case "PRICE_DROP":
      return {
        key: event.type,
        tone: "PLAYFUL",
        variables: { item: event.item, saving: event.saving },
      };
    case "BUDGET_SAVING":
      return {
        key: event.type,
        tone: "PLAYFUL",
        variables: { saving: event.saving },
      };
    case "BUILD_BLOCKER":
      return {
        key: event.type,
        tone: "URGENT",
        variables: { message: event.message },
      };
    case "QUOTE_RECEIVED":
      return { key: event.type, tone: "CALM", variables: { item: event.item } };
    case "INSTALLATION_UPDATE":
      return {
        key: event.type,
        tone: "CALM",
        variables: { message: event.message },
      };
  }
}
