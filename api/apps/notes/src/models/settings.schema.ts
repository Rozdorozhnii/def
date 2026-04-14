import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

// Singleton document — always queried by key: 'site_settings'.
@Schema({ versionKey: false })
export class SettingsDocument extends AbstractDocument {
  @Prop({ required: true, unique: true })
  key: string;

  // Locales available for translation (e.g. ['en', 'de', 'pl']).
  // Managed by super_admin only.
  @Prop({ type: [String], default: ['en'] })
  supportedLocales: string[];
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsDocument);
