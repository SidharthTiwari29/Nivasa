export type AnalyticsEvent = {
  userId?: string;
  sessionId?: string;
  name: string;
  properties?: Record<string, unknown>;
  occurredAt: Date;
};
