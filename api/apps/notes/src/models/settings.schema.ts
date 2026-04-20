import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

// Singleton document — always queried by key: 'site_settings'.
@Schema({ versionKey: false })
export class SettingsDocument extends AbstractDocument {
  @Prop({ required: true, unique: true })
  key: string;

  // All locales ever added by super_admin (persisted even when disabled).
  @Prop({ type: [String], default: ['en'] })
  knownLocales: string[];

  // Active subset of knownLocales — used for AI translation and translator notifications.
  @Prop({ type: [String], default: ['en'] })
  supportedLocales: string[];
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsDocument);
