import { prisma } from "@/server/db/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/errors/AppError";

const assetOwnershipSelect = {
  floorPlans: { select: { property: { select: { ownerId: true } } } },
  designVersion: { select: { project: { select: { ownerId: true } } } },
  job: { select: { project: { select: { ownerId: true } } } },
} as const;

type AssetOwnershipRecord = {
  floorPlans: Array<{ property: { ownerId: string } }>;
  designVersion: { project: { ownerId: string } } | null;
  job: { project: { ownerId: string } } | null;
};

export async function resolveAssetOwnerId(assetId: string): Promise<string> {
  const asset = (await prisma.asset.findUnique({
    where: { id: assetId },
    select: assetOwnershipSelect,
  })) as AssetOwnershipRecord | null;

  if (!asset) throw new NotFoundError("Asset");

  const ownerIds = new Set<string>();
  for (const floorPlan of asset.floorPlans) {
    ownerIds.add(floorPlan.property.ownerId);
  }
  if (asset.designVersion) ownerIds.add(asset.designVersion.project.ownerId);
  if (asset.job) ownerIds.add(asset.job.project.ownerId);

  if (ownerIds.size === 0) {
    throw new ConflictError("Asset has no resolvable owner");
  }
  if (ownerIds.size > 1) {
    throw new ConflictError("Asset has conflicting ownership");
  }

  return [...ownerIds][0];
}

export async function assertAssetOwner(
  assetId: string,
  userId: string,
): Promise<void> {
  const ownerId = await resolveAssetOwnerId(assetId);
  if (ownerId !== userId) throw new ForbiddenError();
}

export function validateAssetObjectKey(objectKey: string): string {
  if (
    objectKey.length === 0 ||
    objectKey.length > 1024 ||
    objectKey.includes("..") ||
    objectKey.startsWith("/") ||
    objectKey.startsWith("\\") ||
    /^[A-Za-z]:[\\/]/.test(objectKey)
  ) {
    throw new ValidationError({ objectKey: ["Invalid object key"] });
  }

  return objectKey;
}

export function buildAssetObjectKey(
  userId: string,
  propertyId: string,
  assetId: string,
): string {
  return validateAssetObjectKey(
    `users/${userId}/properties/${propertyId}/assets/${assetId}`,
  );
}
