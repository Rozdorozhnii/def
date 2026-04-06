import { IsNotEmpty, IsString } from 'class-validator';

// Author provides Ukrainian original content.
// Slug is auto-generated from uk.title (transliterated) and updated to en.title after translation.
export class CreateNoteDto {
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
