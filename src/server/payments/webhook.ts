export type SeenEvent = { provider: string; eventId: string };
export function webhookIdempotencyKey(event: SeenEvent): string {
  return `${event.provider}:${event.eventId}`;
}
