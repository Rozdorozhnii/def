import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NoteLocale, NoteStatus } from '../models/note.schema';

// Used by author (uk) and translator (en) to add or update a translation
export class UpsertTranslationDto {
  @IsEnum(['uk', 'en'])
  locale: NoteLocale;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

// Used by admin to move article through the workflow
export class UpdateNoteStatusDto {
  @IsEnum(NoteStatus)
  status: NoteStatus;
}
