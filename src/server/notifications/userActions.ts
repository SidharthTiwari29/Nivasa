export const USER_ACTIONS = [
  "VIEW",
  "ACKNOWLEDGE",
  "APPROVE",
  "REJECT",
  "RETRY",
  "CANCEL",
] as const;

export type UserAction = (typeof USER_ACTIONS)[number];

export type Notification = {
  id: string;
  userId: string;
  type: string;
  action: UserAction;
  read: boolean;
};

export function acknowledgeNotification(notification: Notification): Notification {
  return { ...notification, read: true };
}

export function applyUserAction(
  notification: Notification,
  action: UserAction,
): Notification {
  if (action !== notification.action) {
    throw new Error(`INVALID_NOTIFICATION_ACTION:${action}`);
  }
  return acknowledgeNotification(notification);
}
