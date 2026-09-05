import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";
import { getAIProvider } from "@/server/ai/provider";

const PARSER_VERSION = "v1";

export type FloorPlanObservationOutput = {
  id: string;
  roomLabel: string;
  confidenceBps: number | null;
  dimensions: Record<string, unknown> | null;
};

export type FloorPlanAnalysisResult =
  | {
      status: "ANALYZED";
      analysisId: string;
      observations: FloorPlanObservationOutput[];
    }
  | {
      status: "NOT_AVAILABLE";
      analysisId: string;
      reason: string;
    };

// The honest boundary this function exists to enforce: it either
// persists a real analysis with real, evidence-backed observations
// computed by a real, configured AI provider, or it records - and
// returns - a genuinely honest NOT_AVAILABLE result. It never invents
// plausible-looking observations to fill the gap.
//
// Every real observation is stored as raw evidence (FloorPlanObservation)
// rather than immediately becoming spatial truth - a human still has to
// review and match each one to a real Room before anything downstream
// (design, BOQ, the 3D scene) can use it. This mirrors the same
// "AI proposes, human confirms" principle already enforced by
// RoomUnderstanding.status and CataloguePrice.verifiedAt.
export async function analyzeFloorPlan(
  floorPlanId: string,
  ownerId: string,
): Promise<FloorPlanAnalysisResult> {
  const floorPlan = await prisma.floorPlan.findFirst({
    where: { id: floorPlanId },
    include: { property: true, asset: true },
  });
  if (!floorPlan || floorPlan.property.ownerId !== ownerId) {
    throw new NotFoundError("FloorPlan");
  }

  const analysis = await prisma.floorPlanAnalysis.create({
    data: {
      floorPlanId,
      status: "PENDING",
      parserVersion: PARSER_VERSION,
    },
  });

  try {
    const result = await getAIProvider().analyzeFloorPlan({
      jobId: `floor-plan-analysis:${analysis.id}`,
      type: "ROOM_UNDERSTANDING",
      input: { assetObjectKey: floorPlan.asset.objectKey },
    });

    // Real provider integration point: the exact shape of `output`
    // depends on the real, configured provider's actual response
    // format, which is not yet known here since no provider is
    // currently configured. This mapping targets the real, persisted
    // FloorPlanObservation shape so that once a real provider exists,
    // wiring its actual output into this shape is the only change
    // needed here - never a redesign of the surrounding contract.
    const output = result.output as {
      rooms?: Array<{
        label: string;
        confidenceBps?: number;
        lengthFt?: number;
        widthFt?: number;
        heightFt?: number;
        doors?: Array<{ widthFt: number; wall?: string }>;
        windows?: Array<{ widthFt: number; wall?: string }>;
      }>;
    };
    const detectedRooms = output.rooms ?? [];

    const observations = await Promise.all(
      detectedRooms.map((room) =>
        prisma.floorPlanObservation.create({
          data: {
            analysisId: analysis.id,
            roomLabel: room.label,
            confidenceBps: room.confidenceBps ?? null,
            dimensions: {
              lengthFt: room.lengthFt,
              widthFt: room.widthFt,
              heightFt: room.heightFt,
              doors: room.doors,
              windows: room.windows,
            },
          },
        }),
      ),
    );

    await prisma.floorPlanAnalysis.update({
      where: { id: analysis.id },
      data: { status: "ANALYZED", completedAt: new Date() },
    });

    return {
      status: "ANALYZED",
      analysisId: analysis.id,
      observations: observations.map(
        (o: {
          id: string;
          roomLabel: string;
          confidenceBps: number | null;
          dimensions: unknown;
        }) => ({
          id: o.id,
          roomLabel: o.roomLabel,
          confidenceBps: o.confidenceBps,
          dimensions: o.dimensions as Record<string, unknown> | null,
        }),
      ),
    };
  } catch (error) {
    const reason =
      error instanceof Error && error.message === "AI_PROVIDER_NOT_CONFIGURED"
        ? "AI-assisted floor plan analysis is not yet available. Please enter dimensions manually."
        : null;

    // Only the one specific, known, expected failure (no provider
    // configured) is turned into an honest NOT_AVAILABLE record. Any
    // other, unexpected error is recorded as a real FAILED analysis
    // and re-thrown - silently swallowing a genuine provider failure
    // would be the same kind of dishonesty this function exists to
    // prevent.
    await prisma.floorPlanAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: reason ? "NOT_AVAILABLE" : "FAILED",
        completedAt: new Date(),
        reason:
          reason ?? (error instanceof Error ? error.message : "Unknown error"),
      },
    });

    if (reason) {
      return { status: "NOT_AVAILABLE", analysisId: analysis.id, reason };
    }
    throw error;
  }
}

// Real, explicit human action: an AI-detected observation becomes
// usable spatial evidence for a real Room only once a person confirms
// the match - never inferred automatically from label similarity or
// any other heuristic, since a wrong automatic match here would
// silently corrupt a real room's understanding.
export async function matchObservationToRoom(
  observationId: string,
  roomId: string,
  ownerId: string,
): Promise<void> {
  const observation = await prisma.floorPlanObservation.findFirst({
    where: { id: observationId },
    include: {
      analysis: { include: { floorPlan: { include: { property: true } } } },
    },
  });
  if (
    !observation ||
    observation.analysis.floorPlan.property.ownerId !== ownerId
  ) {
    throw new NotFoundError("FloorPlanObservation");
  }

  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      propertyId: observation.analysis.floorPlan.propertyId,
    },
  });
  if (!room) throw new NotFoundError("Room");

  await prisma.floorPlanObservation.update({
    where: { id: observationId },
    data: { matchedRoomId: roomId },
  });
}

// The real, explicit counterpart to matchObservationToRoom - a human
// looked at this observation and confirmed it does NOT correspond to
// any real room. Distinct from simply leaving it unmatched, so the
// review workspace can tell "not reviewed yet" apart from "reviewed
// and dismissed."
export async function rejectObservation(
  observationId: string,
  ownerId: string,
): Promise<void> {
  const observation = await prisma.floorPlanObservation.findFirst({
    where: { id: observationId },
    include: {
      analysis: { include: { floorPlan: { include: { property: true } } } },
    },
  });
  if (
    !observation ||
    observation.analysis.floorPlan.property.ownerId !== ownerId
  ) {
    throw new NotFoundError("FloorPlanObservation");
  }

  await prisma.floorPlanObservation.update({
    where: { id: observationId },
    data: { rejected: true },
  });
}

// Real, read-only fetch of every observation from the most recent
// analysis for a floor plan - the actual data the review workspace
// renders. Returns observations exactly as stored; never filters out
// or reinterprets what a human has and hasn't decided yet.
export async function getLatestAnalysisForFloorPlan(
  floorPlanId: string,
  ownerId: string,
) {
  const floorPlan = await prisma.floorPlan.findFirst({
    where: { id: floorPlanId },
    include: { property: true, asset: true },
  });
  if (!floorPlan || floorPlan.property.ownerId !== ownerId) {
    throw new NotFoundError("FloorPlan");
  }

  const analysis = await prisma.floorPlanAnalysis.findFirst({
    where: { floorPlanId },
    orderBy: { requestedAt: "desc" },
    include: { observations: { include: { matchedRoom: true } } },
  });

  return { floorPlan, analysis };
}
