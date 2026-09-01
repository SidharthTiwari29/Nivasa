import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export const assetRepository = {
  findById(id: string) {
    return prisma.asset.findUnique({ where: { id } });
  },

  // The actual cache-hit lookup: checksum here stores the render cache key
  // (see renderCache.ts), not a file-content hash - reusing this existing
  // column rather than adding a new one, since the semantic overlap
  // (a stable identifier for "this exact content already exists") is
  // genuine, and adding a duplicate column with the same purpose would be
  // unnecessary schema growth.
  findByChecksum(checksum: string) {
    return prisma.asset.findFirst({ where: { checksum } });
  },

  findDesignVersionContext(id: string) {
    return prisma.designVersion.findUnique({
      where: { id },
      select: {
        project: {
          select: { ownerId: true, propertyId: true },
        },
      },
    });
  },

  findJobContext(id: string) {
    return prisma.aIJob.findUnique({
      where: { id },
      select: {
        project: {
          select: { ownerId: true, propertyId: true },
        },
      },
    });
  },

  createForDesignVersion(input: {
    designVersionId: string;
    type: Prisma.AssetCreateInput["type"];
    contentType: string;
    sizeBytes?: bigint;
    checksum?: string;
    metadata?: Prisma.InputJsonValue;
    objectKey: string;
  }) {
    return prisma.asset.create({
      data: {
        type: input.type,
        objectKey: input.objectKey,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        checksum: input.checksum,
        metadata: input.metadata,
        designVersion: { connect: { id: input.designVersionId } },
      },
    });
  },

  createForJob(input: {
    jobId: string;
    type: Prisma.AssetCreateInput["type"];
    contentType: string;
    sizeBytes?: bigint;
    checksum?: string;
    metadata?: Prisma.InputJsonValue;
    objectKey: string;
  }) {
    return prisma.asset.create({
      data: {
        type: input.type,
        objectKey: input.objectKey,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        checksum: input.checksum,
        metadata: input.metadata,
        job: { connect: { id: input.jobId } },
      },
    });
  },
};
