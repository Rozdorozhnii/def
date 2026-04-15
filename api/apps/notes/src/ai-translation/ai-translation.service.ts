import { Injectable, Logger } from '@nestjs/common';

import { NotesRepository } from '../notes.repository';
import { NoteOriginal, TranslationStatus } from '../models/note.schema';

@Injectable()
export class AiTranslationService {
  private readonly logger = new Logger(AiTranslationService.name);

  constructor(private readonly notesRepository: NotesRepository) {}

  // Translates the Ukrainian original into targetLocale and saves it with AI_DRAFT status.
  // Currently a stub — replace the translate() call with a real LLM provider when ready.
  async translateNote(
    slug: string,
    original: NoteOriginal,
    targetLocale: string,
  ): Promise<void> {
    const translated = await this.translate(original, targetLocale);

    await this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          [`translations.${targetLocale}`]: {
            title: translated.title,
            description: translated.description,
            body: translated.body,
            translatedBy: null,
            status: TranslationStatus.AI_DRAFT,
          },
        },
      },
    );

    this.logger.log({
      event: 'AI_TRANSLATION_SAVED',
      slug,
      locale: targetLocale,
    });
  }

  // Stub implementation — returns placeholder content.
  // Replace this method body with an actual LLM API call (e.g. Claude, DeepL).
  private translate(
    original: NoteOriginal,
    targetLocale: string,
  ): Promise<{ title: string; description: string; body: string }> {
    return Promise.resolve({
      title: `[${targetLocale.toUpperCase()}] ${original.title}`,
      description: `[${targetLocale.toUpperCase()}] ${original.description}`,
      body: original.body,
    });
  }
}
