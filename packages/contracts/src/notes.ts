export type NoteStatus = 'draft' | 'review' | 'published';
export type NoteLocale = 'uk' | 'en';

export interface NoteTranslation {
  title: string;
  description: string;
  body: string;
  translatedBy: string | null;
}

export interface Note {
  _id: string;
  slug: string;
  status: NoteStatus;
  authorId: string;
  publishedAt: string | null;
  translations: Partial<Record<NoteLocale, NoteTranslation>>;
}
