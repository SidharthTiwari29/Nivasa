import { describe, expect, it } from "vitest";
import {
  acknowledgeNotification,
  applyUserAction,
  type Notification,
} from "./userActions";

const notification: Notification = {
  id: "notification-1",
  userId: "user-1",
  type: "EXECUTION_APPROVAL",
  action: "APPROVE",
  read: false,
};

describe("notification user actions", () => {
  it("acknowledges notifications without changing their action", () => {
    expect(acknowledgeNotification(notification)).toEqual({
      ...notification,
      read: true,
    });
  });

  it("accepts the declared user action and acknowledges it", () => {
    expect(applyUserAction(notification, "APPROVE")).toEqual({
      ...notification,
      read: true,
    });
  });

  it("rejects an action different from the notification action", () => {
    expect(() => applyUserAction(notification, "REJECT")).toThrow(
      "INVALID_NOTIFICATION_ACTION:REJECT",
    );
  });
});
