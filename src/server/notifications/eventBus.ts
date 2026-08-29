export type NivasaEvent =
  | { type: "PRICE_DROP"; item: string; saving: number }
  | { type: "BUDGET_SAVING"; saving: number }
  | { type: "BUILD_BLOCKER"; message: string }
  | { type: "QUOTE_RECEIVED"; item: string }
  | { type: "INSTALLATION_UPDATE"; message: string };

export interface NotificationEventSink {
  publish(event: NivasaEvent): Promise<void>;
}

export function createNotificationEvent(event: NivasaEvent): NivasaEvent {
  return structuredClone(event);
}
