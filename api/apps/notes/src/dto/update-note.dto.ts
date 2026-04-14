import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NoteStatus } from '../models/note.schema';

// Used by author or admin to update the Ukrainian original
export class UpdateOriginalDto {
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

// Used by translator or admin to add / update a non-uk translation
export class UpsertTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

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
