import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as deepl from 'deepl-node';

import { NotesRepository } from '../notes.repository';
import { NoteOriginal, TranslationStatus } from '../models/note.schema';

// DeepL requires language codes like 'en-GB', 'de', 'fr'.
// Our locales use short codes — map the ones that differ.
const LOCALE_TO_DEEPL: Record<string, deepl.TargetLanguageCode> = {
  en: 'en-GB',
};

function toDeeplTarget(locale: string): deepl.TargetLanguageCode {
  return LOCALE_TO_DEEPL[locale] ?? locale;
}

@Injectable()
export class AiTranslationService {
  private readonly logger = new Logger(AiTranslationService.name);
  private readonly translator: deepl.Translator;

  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('DEEPL_API_KEY');
    this.translator = new deepl.Translator(apiKey);
  }

  // Translates the Ukrainian original into targetLocale and saves it with AI_DRAFT status.
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

  private async translate(
    original: NoteOriginal,
    targetLocale: string,
  ): Promise<{ title: string; description: string; body: string }> {
    const target = toDeeplTarget(targetLocale);

    const [titleResult, descResult, bodyResult] = await Promise.all([
      this.translator.translateText(original.title, 'uk', target),
      this.translator.translateText(original.description, 'uk', target),
      // tag_handling: 'html' preserves TipTap HTML markup during translation
      this.translator.translateText(original.body, 'uk', target, {
        tagHandling: 'html',
      }),
    ]);

    return {
      title: titleResult.text,
      description: descResult.text,
      body: bodyResult.text,
    };
  }
}
