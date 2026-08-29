import type { VisualizationPlan } from "./visualization";

export type ImmersiveScene = {
  sceneId: string;
  projectId: string;
  versionId: string;
  roomOrder: string[];
  navigationEdges: Array<{ fromRoomId: string; toRoomId: string }>;
  firstPerson: true;
  humanScale: true;
  spatiallyConsistent: true;
  lockedDecisionIds: string[];
};

export function buildImmersiveScene(
  plan: VisualizationPlan,
  navigationEdges: Array<{ fromRoomId: string; toRoomId: string }>,
): ImmersiveScene {
  const roomIds = new Set(plan.roomIds);
  const validEdges = navigationEdges.filter((edge) => roomIds.has(edge.fromRoomId) && roomIds.has(edge.toRoomId));
  return {
    sceneId: `immersive:${plan.projectId}:${plan.versionId}`,
    projectId: plan.projectId,
    versionId: plan.versionId,
    roomOrder: [...plan.roomIds],
    navigationEdges: validEdges,
    firstPerson: true,
    humanScale: true,
    spatiallyConsistent: true,
    lockedDecisionIds: [...plan.lockedDecisionIds],
  };
}
