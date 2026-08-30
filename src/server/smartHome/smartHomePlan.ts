import type { SmartHomePlanInput } from "@/server/validators/smartHome";

export type SmartHomePlan = SmartHomePlanInput & {
  enabledCapabilityIds: string[];
  activeScenarioIds: string[];
};

export const compileSmartHomePlan = (input: SmartHomePlanInput): SmartHomePlan => {
  const capabilitiesById = new Map<string, SmartHomePlanInput["capabilities"][number]>();

  for (const capability of input.capabilities) {
    const existing = capabilitiesById.get(capability.id);
    if (!existing || capability.enabled) {
      capabilitiesById.set(capability.id, capability);
    }
  }

  const capabilities = [...capabilitiesById.values()];
  const enabledCapabilityIds = capabilities
    .filter((capability) => capability.enabled)
    .map((capability) => capability.id);
  const enabledSet = new Set(enabledCapabilityIds);
  const scenarios = input.scenarios.filter(
    (scenario) => scenario.capabilityIds.every((id) => enabledSet.has(id)),
  );

  return {
    ...input,
    capabilities,
    scenarios,
    enabledCapabilityIds,
    activeScenarioIds: scenarios
      .filter((scenario) => scenario.enabled)
      .map((scenario) => scenario.id),
  };
};

export const mergeSmartHomePlan = (
  current: unknown,
  patch: Partial<SmartHomePlanInput>,
): SmartHomePlan => {
  const existing = (current ?? {}) as Partial<SmartHomePlanInput>;
  return compileSmartHomePlan({
    capabilities: patch.capabilities ?? existing.capabilities ?? [],
    scenarios: patch.scenarios ?? existing.scenarios ?? [],
    visualizationState:
      patch.visualizationState ?? existing.visualizationState ?? "PREVIEW",
    budgetMinor:
      patch.budgetMinor === undefined
        ? existing.budgetMinor ?? null
        : patch.budgetMinor,
    notes: patch.notes ?? existing.notes,
  });
};
