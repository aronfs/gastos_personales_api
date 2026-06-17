import { settingsRepository } from '../repositories/settings.repository';
import type { UpdateSettingsInput } from '../validators/settings.validator';

export const settingsService = {
  async getByUserId(userId: string) {
    const settings = await settingsRepository.findByUserId(userId);
    if (!settings) {
      // Auto-create if missing
      return settingsRepository.upsert(userId, {
        currency: 'USD',
        language: 'es',
        theme: 'light',
        notificationsEnabled: true,
      });
    }
    return settings;
  },

  async update(userId: string, data: UpdateSettingsInput) {
    return settingsRepository.upsert(userId, data);
  },
};
