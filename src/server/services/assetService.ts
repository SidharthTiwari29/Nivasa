import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/server/errors/AppError";
import {
  assertAssetOwner,
  buildAssetObjectKey,
} from "./assetAuthorization";
import { assetRepository } from "@/server/repositories/assetRepository";
import { getStorageProvider } from "@/server/storage/provider";
import type { CreateAssetInput } from "@/server/validators/asset";

const SIGNED_URL_TTL_SECONDS = 600;

export const assetService = {
  async createUpload(userId: string, input: CreateAssetInput) {
    let ownerId: string;
    let propertyId: string;

    if (input.designVersionId) {
      const context = await assetRepository.findDesignVersionContext(
        input.designVersionId,
      );
      if (!context) throw new NotFoundError("DesignVersion");
      ownerId = context.project.ownerId;
      propertyId = context.project.propertyId;
    } else if (input.jobId) {
      const context = await assetRepository.findJobContext(input.jobId);
      if (!context) throw new NotFoundError("AIJob");
      ownerId = context.project.ownerId;
      propertyId = context.project.propertyId;
    } else {
      throw new NotFoundError("Asset parent");
    }

    if (ownerId !== userId) throw new ForbiddenError();

    const storage = getStorageProvider();
    const objectKey = buildAssetObjectKey(userId, propertyId, randomUUID());
    const metadata = input.metadata as Prisma.InputJsonValue | undefined;
    const sizeBytes =
      input.sizeBytes === undefined ? undefined : BigInt(input.sizeBytes);
    const asset = input.designVersionId
      ? await assetRepository.createForDesignVersion({
          designVersionId: input.designVersionId,
          type: input.type,
          contentType: input.contentType,
          sizeBytes,
          checksum: input.checksum,
          metadata,
          objectKey,
        })
      : await assetRepository.createForJob({
          jobId: input.jobId!,
          type: input.type,
          contentType: input.contentType,
          sizeBytes,
          checksum: input.checksum,
          metadata,
          objectKey,
        });

    const grant = await storage.createUploadGrant({
      objectKey: asset.objectKey,
      contentType: asset.contentType,
      expiresInSeconds: SIGNED_URL_TTL_SECONDS,
    });

    return { asset, grant };
  },

  async createDownloadUrl(assetId: string, userId: string) {
    await assertAssetOwner(assetId, userId);
    const asset = await assetRepository.findById(assetId);
    if (!asset) throw new NotFoundError("Asset");
    const downloadUrl = await getStorageProvider().createDownloadUrl(
      asset.objectKey,
      SIGNED_URL_TTL_SECONDS,
    );
    return { asset, downloadUrl };
  },
};
