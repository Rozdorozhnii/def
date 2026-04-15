import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

export enum NoteStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
}

export enum TranslationStatus {
  DRAFT = 'draft',                   // manually started, empty or work-in-progress
  AI_DRAFT = 'ai_draft',             // machine-translated, awaiting human review
  PENDING_REVIEW = 'pending_review', // submitted by translator, awaiting admin approval
  APPROVED = 'approved',             // approved by admin, ready to publish
}

// The Ukrainian original — source of truth, no workflow status needed.
@Schema({ _id: false })
export class NoteOriginal {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string; // 150-160 chars for SEO / social sharing

  @Prop({ required: true })
  body: string; // HTML from WYSIWYG editor
}

export const NoteOriginalSchema = SchemaFactory.createForClass(NoteOriginal);

// A translated version of the article for a specific locale.
@Schema({ _id: false })
export class NoteTranslation {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: String, default: null })
  translatedBy: string | null; // userId of the translator (null if AI-generated without human edit)

  @Prop({ type: String, enum: TranslationStatus, default: TranslationStatus.DRAFT })
  status: TranslationStatus;
}

export const NoteTranslationSchema = SchemaFactory.createForClass(NoteTranslation);

@Schema({ versionKey: false })
export class NoteDocument extends AbstractDocument {
  // Generated from original.title (transliterated), updated to en.title after translation
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: String, enum: NoteStatus, default: NoteStatus.DRAFT })
  status: NoteStatus;

  @Prop({ required: true })
  authorId: string;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  // Ukrainian original — the source all translators work from.
  @Prop({ type: NoteOriginalSchema, default: undefined })
  original: NoteOriginal;

  // Translations keyed by locale string (e.g. 'en', 'de', 'pl').
  // Locales are managed dynamically via SettingsService — no hardcoded enum.
  @Prop({ type: Map, of: NoteTranslationSchema, default: {} })
  translations: Map<string, NoteTranslation>;
}

export const NoteSchema = SchemaFactory.createForClass(NoteDocument);
