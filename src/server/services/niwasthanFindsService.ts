import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { niwasthanFindsRepository } from "@/server/repositories/niwasthanFindsRepository";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { buildNiwasthanFind } from "@/server/personality/momentTemplates";
import { notificationService } from "@/server/services/notificationService";
import { featureAccessService } from "@/server/entitlements/featureAccessService";

export const niwasthanFindsService = {
  // README §33: "the proactive discovery layer." This is the real
  // connective tissue between two things that already existed separately:
  // the budget-driven curation engine's real, currently-priced catalogue
  // data (catalogueCurationRepository), and the Niwasthan Find message
  // format (buildNiwasthanFind). Given one of the user's already-selected
  // BOQ line items, this checks whether a genuinely cheaper real
  // alternative exists in the same category right now, and if so, fires
  // a real notification - never a fabricated "we found a deal" without an
  // actual cheaper item behind it.
  async scanForBetterOption(boqLineId: string, ownerId: string) {
    await featureAccessService.requireFeature(ownerId, "niwasthan_finds");

    const selected = await niwasthanFindsRepository.findSelectedItemForOwner(
      boqLineId,
      ownerId,
    );
    if (!selected) throw new NotFoundError("BoqLine");
    if (!selected.catalogueItemId || !selected.catalogueItem) {
      throw new ConflictError(
        "This line item is not linked to a catalogue product - nothing to scan for alternatives against",
      );
    }

    const optionsByCategory =
      await catalogueCurationRepository.findActiveOptionsByCategories([
        selected.catalogueItem.category,
      ]);
    const options =
      optionsByCategory.get(selected.catalogueItem.category) ?? [];
    const cheaperOptions = options.filter(
      (o) =>
        o.itemId !== selected.catalogueItemId &&
        o.unitPriceMinor < selected.unitPriceMinor,
    );
    if (cheaperOptions.length === 0) return null;

    const bestAlternative = cheaperOptions.reduce((min, o) =>
      o.unitPriceMinor < min.unitPriceMinor ? o : min,
    );

    const find = buildNiwasthanFind({
      selectedItemName: selected.description,
      selectedPriceMinor: selected.unitPriceMinor,
      alternativeName: bestAlternative.name,
      alternativePriceMinor: bestAlternative.unitPriceMinor,
    });
    if (!find) return null; // defensive - the filter above already guarantees this, but never assume

    await notificationService.notify({
      userId: ownerId,
      type: "BETTER_ALTERNATIVE_FOUND",
      title: find.title,
      message: `${find.alternativeName} is available for less than your selected ${find.selectedItemName}.`,
      relatedEntityType: "BoqLine",
      relatedEntityId: boqLineId,
    });

    return find;
  },
};
