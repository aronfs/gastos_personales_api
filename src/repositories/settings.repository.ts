import { prisma } from '../config/database';

export const settingsRepository = {
  async findByUserId(userId: string) {
    return prisma.setting.findUnique({ where: { userId } });
  },

  async upsert(
    userId: string,
    data: {
      currency?: string;
      language?: string;
      theme?: string;
      notificationsEnabled?: boolean;
    },
  ) {
    return prisma.setting.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        currency: data.currency || 'USD',
        language: data.language || 'es',
        theme: data.theme || 'light',
        notificationsEnabled: data.notificationsEnabled ?? true,
      },
    });
  },
};
