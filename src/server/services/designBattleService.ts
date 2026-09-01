import { NotFoundError } from "@/server/errors/AppError";
import { designBattleRepository } from "@/server/repositories/designBattleRepository";
import { compareDesigns } from "@/server/services/designBattle";

export const designBattleService = {
  async battle(projectAId: string, projectBId: string, ownerId: string) {
    const [projectA, projectB] = await Promise.all([
      designBattleRepository.findProjectForOwner(projectAId, ownerId),
      designBattleRepository.findProjectForOwner(projectBId, ownerId),
    ]);
    if (!projectA) throw new NotFoundError(`DesignProject ${projectAId}`);
    if (!projectB) throw new NotFoundError(`DesignProject ${projectBId}`);

    const [boqA, boqB] = await Promise.all([
      designBattleRepository.findLatestBoqForProject(projectAId),
      designBattleRepository.findLatestBoqForProject(projectBId),
    ]);

    return compareDesigns(
      { projectId: projectA.id, projectName: projectA.name, boq: boqA },
      { projectId: projectB.id, projectName: projectB.name, boq: boqB },
    );
  },
};
