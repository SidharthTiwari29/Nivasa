import { prisma } from "@/server/db/prisma";

export async function createDesignProject(input: { ownerId: string; propertyId: string; roomId?: string; name: string }) {
  const property = await prisma.property.findFirst({ where: { id: input.propertyId, ownerId: input.ownerId } });
  if (!property) throw new Error("PROPERTY_NOT_FOUND");
  if (input.roomId) {
    const room = await prisma.room.findFirst({ where: { id: input.roomId, propertyId: input.propertyId } });
    if (!room) throw new Error("ROOM_NOT_FOUND");
  }
  return prisma.designProject.create({ data: input, include: { versions: true, revisions: true } });
}

export async function createDesignVersion(input: { ownerId: string; projectId: string; prompt?: string; parameters?: Record<string, unknown> }) {
  const project = await prisma.designProject.findFirst({ where: { id: input.projectId, ownerId: input.ownerId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const latest = await prisma.designVersion.findFirst({ where: { projectId: input.projectId }, orderBy: { version: "desc" } });
  return prisma.designVersion.create({ data: { projectId: input.projectId, version: (latest?.version ?? 0) + 1, prompt: input.prompt, parameters: input.parameters } });
}

export async function createDesignRevision(input: { ownerId: string; projectId: string; baseVersionId: string; instruction: string; parameters?: Record<string, unknown> }) {
  const project = await prisma.designProject.findFirst({ where: { id: input.projectId, ownerId: input.ownerId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const version = await prisma.designVersion.findFirst({ where: { id: input.baseVersionId, projectId: input.projectId } });
  if (!version) throw new Error("VERSION_NOT_FOUND");
  const latest = await prisma.designRevision.findFirst({ where: { projectId: input.projectId }, orderBy: { revisionNumber: "desc" } });
  return prisma.designRevision.create({ data: { projectId: input.projectId, baseVersionId: input.baseVersionId, revisionNumber: (latest?.revisionNumber ?? 0) + 1, instruction: input.instruction, parameters: input.parameters } });
}
