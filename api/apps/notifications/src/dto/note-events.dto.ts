import { IsArray, IsString } from 'class-validator';

export class NoteSentToReviewDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}

export class NoteSentForTranslationDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}

export class NoteTranslationSubmittedDto {
  @IsString()
  slug: string;

  @IsString()
  locale: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}

export class NoteTranslationApprovedDto {
  @IsString()
  slug: string;

  @IsString()
  locale: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}

export class NoteTranslationCorrectionRequestedDto {
  @IsString()
  slug: string;

  @IsString()
  locale: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}

export class NoteTranslationCorrectionSubmittedDto {
  @IsString()
  slug: string;

  @IsString()
  locale: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  emails: string[];
}