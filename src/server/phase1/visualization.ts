export type SpatialTruth = {
  propertyId: string;
  floorPlanVersion: number;
  rooms: Array<{
    id: string;
    name: string;
    geometry: unknown;
    confidenceBps: number;
  }>;
};

export type ApprovedDesign = {
  projectId: string;
  versionId: string;
  approvedAt: Date;
  lockedDecisionIds: string[];
  designElements: Array<{ id: string; roomId: string; kind: string; source: "REAL" | "ILLUSTRATIVE" }>;
};

export type VisualizationRequest = {
  spatialTruth: SpatialTruth;
  design: ApprovedDesign;
  requestedViews: Array<"LIVING" | "KITCHEN" | "BEDROOM" | "BATHROOM" | "WHOLE_HOME">;
};

export type VisualizationPlan = {
  projectId: string;
  versionId: string;
  mode: "ACTUAL_APARTMENT";
  spatiallyGrounded: true;
  roomIds: string[];
  lockedDecisionIds: string[];
  illustrativeElementIds: string[];
  warnings: string[];
};

export function buildActualApartmentVisualizationPlan(input: VisualizationRequest): VisualizationPlan {
  if (!input.spatialTruth.propertyId || !input.design.projectId || !input.design.versionId) {
    throw new Error("VISUALIZATION_CONTEXT_REQUIRED");
  }
  if (input.spatialTruth.rooms.length === 0) throw new Error("VERIFIED_SPATIAL_MODEL_REQUIRED");
  const warnings = input.spatialTruth.rooms.some((room) => room.confidenceBps < 7000)
    ? ["Some spatial inputs have low confidence and require verification before execution use."]
    : [];
  return {
    projectId: input.design.projectId,
    versionId: input.design.versionId,
    mode: "ACTUAL_APARTMENT",
    spatiallyGrounded: true,
    roomIds: input.spatialTruth.rooms.map((room) => room.id),
    lockedDecisionIds: [...input.design.lockedDecisionIds],
    illustrativeElementIds: input.design.designElements.filter((element) => element.source === "ILLUSTRATIVE").map((element) => element.id),
    warnings,
  };
}
