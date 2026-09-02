import { prisma } from "@/server/db/prisma";

export const signupSignalRepository = {
  findExisting(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { signupIpAddress: true, signupUserAgent: true },
    });
  },

  record(userId: string, ipAddress: string | null, userAgent: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { signupIpAddress: ipAddress, signupUserAgent: userAgent },
    });
  },
};
