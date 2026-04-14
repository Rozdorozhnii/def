import { Injectable } from '@nestjs/common';

import { SettingsRepository } from './settings.repository';

const SETTINGS_KEY = 'site_settings';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSettings() {
    const settings = await this.settingsRepository.findOneOrNull({ key: SETTINGS_KEY });
    if (!settings) {
      // Return defaults if not yet initialized
      return { supportedLocales: ['en'] };
    }
    return { supportedLocales: settings.supportedLocales };
  }

  async updateSupportedLocales(locales: string[]) {
    const existing = await this.settingsRepository.findOneOrNull({ key: SETTINGS_KEY });

    if (!existing) {
      return this.settingsRepository.create({
        key: SETTINGS_KEY,
        supportedLocales: locales,
      });
    }

    return this.settingsRepository.findandUpdate(
      { key: SETTINGS_KEY },
      { $set: { supportedLocales: locales } },
    );
  }
}
