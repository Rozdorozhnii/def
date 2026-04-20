export type NoteStatus = 'draft' | 'review' | 'published';
export type TranslationStatus = 'draft' | 'ai_draft' | 'pending_review' | 'approved';

// The Ukrainian original — source of truth, no workflow status.
export interface NoteOriginal {
  title: string;
  description: string;
  body: string;
}

// A translated version with its own workflow status.
export interface NoteTranslation {
  title: string;
  description: string;
  body: string;
  translatedBy: string | null;
  status: TranslationStatus;
}

export interface Note {
  _id: string;
  slug: string;
  status: NoteStatus;
  authorId: string;
  publishedAt: string | null;
  original: NoteOriginal;
  // Keyed by locale string — locales managed dynamically via settings
  translations: Record<string, NoteTranslation>;
}

export interface SiteSettings {
  knownLocales: string[];      // all locales ever added (persisted even when disabled)
  supportedLocales: string[];  // active subset — used for AI translation and notifications
}
