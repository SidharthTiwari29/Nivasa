export type MomentEvent =
  | { type: "PRICE_DROP"; itemName: string; savingMinor: bigint }
  | { type: "BETTER_ALTERNATIVE"; itemName: string; alternativeName: string; savingMinor: bigint }
  | { type: "BUDGET_EXCEEDED"; amountMinor: bigint }
  | { type: "DESIGN_LOCKED"; name: string }
  | { type: "WALKTHROUGH_READY"; projectName: string };

export type NotificationPreferences = {
  enabled: boolean;
  quietHours?: { startHour: number; endHour: number };
  minimumIntervalMinutes: number;
};

export type NivasaMoment = {
  title: string;
  body: string;
  priority: "TRANSACTIONAL" | "IMPORTANT" | "DELIGHT";
  eventType: MomentEvent["type"];
};

function inQuietHours(hour: number, quietHours?: NotificationPreferences["quietHours"]): boolean {
  if (!quietHours) return false;
  if (quietHours.startHour === quietHours.endHour) return true;
  return quietHours.startHour < quietHours.endHour
    ? hour >= quietHours.startHour && hour < quietHours.endHour
    : hour >= quietHours.startHour || hour < quietHours.endHour;
}

export function createNivasaMoment(
  event: MomentEvent,
  preferences: NotificationPreferences,
  currentHour: number,
): NivasaMoment | null {
  if (!preferences.enabled) return null;
  const quiet = inQuietHours(currentHour, preferences.quietHours);
  const transactional = event.type === "BUDGET_EXCEEDED";
  if (quiet && !transactional) return null;

  switch (event.type) {
    case "PRICE_DROP":
      return { title: "Nivasa found a saving", body: `${event.itemName} just got cheaper.`, priority: "DELIGHT", eventType: event.type };
    case "BETTER_ALTERNATIVE":
      return { title: "We found a better option", body: `${event.alternativeName} could save you without silently changing your choice.`, priority: "DELIGHT", eventType: event.type };
    case "BUDGET_EXCEEDED":
      return { title: "Budget alert", body: "Your current project estimate is above the budget target.", priority: "TRANSACTIONAL", eventType: event.type };
    case "DESIGN_LOCKED":
      return { title: "Decision locked", body: `${event.name} is locked and will not be silently changed.`, priority: "IMPORTANT", eventType: event.type };
    case "WALKTHROUGH_READY":
      return { title: "Your future home is ready", body: `${event.projectName} is ready to explore.`, priority: "DELIGHT", eventType: event.type };
  }
}
