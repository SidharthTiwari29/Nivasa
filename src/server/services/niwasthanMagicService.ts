import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { designBoqGenerationRepository } from "@/server/repositories/designBoqGenerationRepository";
import { catalogueCurationService } from "@/server/services/catalogueCurationService";
import { getRoomSmartUpgrades } from "@/server/services/roomSmartUpgrades";
import { featureAccessService } from "@/server/entitlements/featureAccessService";

export const niwasthanMagicService = {
  // Real, plan-gated smart-home product suggestions - checked before
  // anything else runs, the same enforcement-first pattern used for
  // procurement and negotiation elsewhere in this codebase.
  async suggestSmartUpgrades(
    projectId: string,
    ownerId: string,
    upgradeBudgetMinor: bigint,
  ) {
    await featureAccessService.requireFeature(ownerId, "niwasthan_magic");

    const project =
      await designBoqGenerationRepository.findProjectWithRoomForOwner(
        projectId,
        ownerId,
      );
    if (!project) throw new NotFoundError("DesignProject");
    if (!project.room) {
      throw new ConflictError(
        "This design project is not tied to a specific room - smart upgrade suggestions need to know which room they're for",
      );
    }

    const upgrades = getRoomSmartUpgrades(project.room.type);
    if (upgrades.length === 0) {
      // Honest, not an error - a bathroom genuinely has no defined smart
      // upgrade suggestions today. Returning an empty result is correct;
      // throwing would misrepresent "nothing to suggest" as a failure.
      return { selections: [], totalMinor: 0n };
    }

    return catalogueCurationService.curate(upgrades, upgradeBudgetMinor);
  },
};
