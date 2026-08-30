import { NotFoundError } from "@/server/errors/AppError";
import { homeIntelligenceRepository } from "@/server/repositories/homeIntelligenceRepository";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import {
  checkBudgetRealism,
  checkDoorClearance,
  checkRoomAreaAdequacy,
  checkRoomUnderstandingConfidence,
  type QualityFlag,
} from "@/server/services/designQualityChecks";

export const designQualityService = {
  // README §4: runs every deterministic quality check against a property's
  // actual current data (rooms, their latest confirmed/unconfirmed
  // understanding, and its latest budget version if one exists) and
  // returns a single, explainable flag list - the "identify poor or risky
  // decisions" capability, built on real data rather than a simulated
  // ergonomic model this schema doesn't support yet.
  async runChecks(propertyId: string, ownerId: string): Promise<QualityFlag[]> {
    const property = await homeIntelligenceRepository.findForOwner(
      propertyId,
      ownerId,
    );
    if (!property) throw new NotFoundError("Property");

    const flags: QualityFlag[] = [];

    for (const room of property.rooms) {
      flags.push(
        ...checkRoomAreaAdequacy(
          room.id,
          room.type,
          room.areaSqFt !== null ? Number(room.areaSqFt) : null,
        ),
      );

      const latestUnderstanding = room.roomUnderstandings[0];
      if (latestUnderstanding) {
        flags.push(
          ...checkRoomUnderstandingConfidence(
            room.id,
            latestUnderstanding.status,
            latestUnderstanding.confidenceBps,
          ),
        );
        flags.push(
          ...checkDoorClearance(
            room.id,
            latestUnderstanding.dimensions as never,
          ),
        );
      }
    }

    const plan = await budgetRepository.findPlan(propertyId, ownerId);
    const latestVersion = plan?.versions[0];
    if (latestVersion) {
      const totalAreaSqFt = property.rooms.reduce(
        (sum, r) => sum + (r.areaSqFt !== null ? Number(r.areaSqFt) : 0),
        0,
      );
      flags.push(
        ...checkBudgetRealism(latestVersion.totalTargetMinor, totalAreaSqFt),
      );
    }

    return flags;
  },
};
