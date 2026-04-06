import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

export enum NoteStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
}

export type NoteLocale = 'uk' | 'en';

@Schema({ _id: false })
export class NoteTranslation {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string; // Short summary for SEO and social sharing (150-160 chars)

  @Prop({ required: true })
  body: string; // HTML from WYSIWYG editor

  @Prop({ type: String, default: null })
  translatedBy: string | null; // userId of translator, null for original (uk)
}

export const NoteTranslationSchema =
  SchemaFactory.createForClass(NoteTranslation);

@Schema({ versionKey: false })
export class NoteDocument extends AbstractDocument {
  // Generated from uk.title initially (transliterated), updated to en.title after translation
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: String, enum: NoteStatus, default: NoteStatus.DRAFT })
  status: NoteStatus;

  @Prop({ required: true })
  authorId: string;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({
    type: {
      uk: { type: NoteTranslationSchema, default: undefined },
      en: { type: NoteTranslationSchema, default: undefined },
    },
    // _id: false prevents Mongoose from adding an _id to the translations wrapper object
    _id: false,
    default: {},
  })
  translations: Partial<Record<NoteLocale, NoteTranslation>>;
}

export const NoteSchema = SchemaFactory.createForClass(NoteDocument);
