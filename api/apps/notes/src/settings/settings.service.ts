import { Injectable } from '@nestjs/common';

import { SettingsRepository } from './settings.repository';

const SETTINGS_KEY = 'site_settings';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSettings() {
    const settings = await this.settingsRepository.findOneOrNull({
      key: SETTINGS_KEY,
    });
    if (!settings) {
      return { knownLocales: ['en'], supportedLocales: ['en'] };
    }
    return {
      // Fall back to supportedLocales for documents created before knownLocales was added
      knownLocales:
        (settings.knownLocales as string[] | undefined) ??
        settings.supportedLocales,
      supportedLocales: settings.supportedLocales,
    };
  }

  // knownLocales — all locales ever added (persisted even when disabled).
  // supportedLocales — active subset used for AI translation and notifications.
  async updateLocales(knownLocales: string[], supportedLocales: string[]) {
    const existing = await this.settingsRepository.findOneOrNull({
      key: SETTINGS_KEY,
    });

    if (!existing) {
      return this.settingsRepository.create({
        key: SETTINGS_KEY,
        knownLocales,
        supportedLocales,
      });
    }

    return this.settingsRepository.findandUpdate(
      { key: SETTINGS_KEY },
      { $set: { knownLocales, supportedLocales } },
    );
  }
}
