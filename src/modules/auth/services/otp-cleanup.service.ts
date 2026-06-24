import { prisma } from "../../../infrastructure/prisma/prisma.client";

export const otpCleanupService = {
  async deleteOldChallenges() {
    const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return prisma.authOtpChallenge.deleteMany({
      where: {
        expiresAt: {
          lt: olderThan,
        },
      },
    });
  },
};
