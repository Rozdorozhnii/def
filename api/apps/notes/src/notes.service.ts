import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreateNoteDto } from './dto/create-note.dto';
import {
  UpdateOriginalDto,
  UpsertTranslationDto,
  UpdateNoteStatusDto,
} from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { SettingsService } from './settings/settings.service';
import { AiTranslationService } from './ai-translation/ai-translation.service';
import {
  NoteStatus,
  NoteOriginal,
  NoteTranslation,
  TranslationStatus,
} from './models/note.schema';
import {
  AUTH_SERVICE,
  NOTIFICATIONS_SERVICE,
  UserDto,
  UserRole,
} from '@app/common';

// Maps each Cyrillic character to its Latin equivalent for URL-safe slugs.
const CYRILLIC_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((c) => CYRILLIC_MAP[c] ?? c)
    .join('');
}

function toSlug(title: string): string {
  return transliterate(title)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function isAdmin(user: UserDto): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
}

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly settingsService: SettingsService,
    private readonly aiTranslationService: AiTranslationService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
    @Inject(AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  // Fire-and-forget: delegates to AiTranslationService which saves result with AI_DRAFT status.
  private runAiTranslation(
    slug: string,
    original: NoteOriginal,
    targetLocale: string,
  ): Promise<void> {
    return this.aiTranslationService.translateNote(
      slug,
      original,
      targetLocale,
    );
  }

  // Creates a new article draft with the Ukrainian original.
  // AUTHOR role or any translator whose locales include 'uk' can create.
  async create(dto: CreateNoteDto, user: UserDto) {
    if (!isAdmin(user)) {
      const userLocales: string[] = Array.isArray(user.locales)
        ? user.locales
        : [];
      const canWriteOriginal =
        user.role === UserRole.AUTHOR || userLocales.includes('uk');
      if (!canWriteOriginal) {
        throw new ForbiddenException(
          'Only authors or translators with Ukrainian locale can create articles',
        );
      }
    }

    const slug = toSlug(dto.title);

    const existing = await this.notesRepository.findOneOrNull({ slug });
    if (existing) {
      throw new BadRequestException(`Slug "${slug}" already exists`);
    }

    return this.notesRepository.create({
      slug,
      status: NoteStatus.DRAFT,
      authorId: user._id,
      publishedAt: null,
      original: {
        title: dto.title,
        description: dto.description,
        body: dto.body,
      },
      translations: new Map(),
    });
  }

  // Public — returns only PUBLISHED articles.
  findPublished() {
    return this.notesRepository.find({ status: NoteStatus.PUBLISHED });
  }

  // Public — returns a single published article by slug.
  findOnePublished(slug: string) {
    return this.notesRepository.findOne({ slug, status: NoteStatus.PUBLISHED });
  }

  // Returns articles filtered by role:
  //   ADMIN / SUPER_ADMIN — all articles
  //   AUTHOR              — own articles (all statuses)
  //   TRANSLATOR          — articles in REVIEW (ready to translate)
  findAll(user: UserDto) {
    if (user.role === UserRole.SUPER_ADMIN)
      return this.notesRepository.find({});
    if (user.role === UserRole.ADMIN)
      return this.notesRepository.find({
        status: { $in: [NoteStatus.REVIEW, NoteStatus.PUBLISHED] },
      });
    if (user.role === UserRole.AUTHOR)
      return this.notesRepository.find({ authorId: user._id });
    if (user.role === UserRole.TRANSLATOR)
      return this.notesRepository.find({
        status: { $in: [NoteStatus.REVIEW, NoteStatus.PUBLISHED] },
      });
    throw new ForbiddenException();
  }

  // Returns a single article by slug for the admin panel.
  async findOne(slug: string, user: UserDto) {
    if (user.role === UserRole.SUPER_ADMIN)
      return this.notesRepository.findOne({ slug });
    if (user.role === UserRole.ADMIN)
      return this.notesRepository.findOne({
        slug,
        status: { $in: [NoteStatus.REVIEW, NoteStatus.PUBLISHED] },
      });
    if (user.role === UserRole.AUTHOR)
      return this.notesRepository.findOne({ slug, authorId: user._id });
    if (user.role === UserRole.TRANSLATOR)
      return this.notesRepository.findOne({
        slug,
        status: { $in: [NoteStatus.REVIEW, NoteStatus.PUBLISHED] },
      });
    throw new ForbiddenException();
  }

  // Updates the Ukrainian original content.
  // Only the article's author or admin can edit the original.
  async updateOriginal(slug: string, dto: UpdateOriginalDto, user: UserDto) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user) && note.authorId !== user._id) {
      throw new ForbiddenException('Only the author can edit the original');
    }

    return this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          original: {
            title: dto.title,
            description: dto.description,
            body: dto.body,
          },
        },
      },
    );
  }

  // Adds or updates a translation for a specific locale.
  // TRANSLATOR can only edit locales assigned to them.
  // Admin save is auto-APPROVED; translator save resets to DRAFT.
  // Slug is updated from en.title for better western audience URLs.
  async upsertTranslation(
    slug: string,
    dto: UpsertTranslationDto,
    user: UserDto,
  ) {
    if (!isAdmin(user)) {
      const userLocales: string[] = Array.isArray(user.locales)
        ? user.locales
        : [];
      if (!userLocales.includes(dto.locale)) {
        throw new ForbiddenException(
          'You do not have permission to translate this locale',
        );
      }
    }

    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      const existing = (
        note.translations as unknown as Record<
          string,
          NoteTranslation | undefined
        >
      )[dto.locale];
      if (existing?.status === TranslationStatus.APPROVED) {
        throw new ForbiddenException(
          'This translation is approved. Ask an admin to request a correction.',
        );
      }
    }

    const newSlug = dto.locale === 'en' ? sanitizeSlug(dto.title) : slug;
    const status = isAdmin(user)
      ? TranslationStatus.APPROVED
      : TranslationStatus.DRAFT;

    return this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          slug: newSlug,
          [`translations.${dto.locale}`]: {
            title: dto.title,
            description: dto.description,
            body: dto.body,
            translatedBy: user._id,
            status,
          },
        },
      },
    );
  }

  // Translator submits a translation for admin review.
  // Changes translation status DRAFT → PENDING_REVIEW.
  // Notifies all users subscribed to 'publication_ready' (admins).
  async submitTranslationForReview(
    slug: string,
    locale: string,
    user: UserDto,
  ) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      const userLocales: string[] = Array.isArray(user.locales)
        ? user.locales
        : [];
      if (!userLocales.includes(locale)) {
        throw new ForbiddenException(
          'You do not have permission to submit this locale for review',
        );
      }
    }

    const translation = (
      note.translations as unknown as Record<
        string,
        NoteTranslation | undefined
      >
    )[locale];
    if (!translation) {
      throw new BadRequestException(`No ${locale} translation exists yet`);
    }

    const updated = await this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          [`translations.${locale}.status`]: TranslationStatus.PENDING_REVIEW,
        },
      },
    );

    // Notify admins subscribed to 'publication_ready'
    const emails = await firstValueFrom(
      this.authService.send<string[]>('get_subscriber_emails', {
        subscriptionType: 'publication_ready',
      }),
    );
    if (emails.length > 0) {
      this.notificationsService.emit('note.translation_submitted', {
        slug,
        locale,
        title: note.original.title,
        emails,
      });
    }

    return updated;
  }

  // Translator revokes a translation review — PENDING_REVIEW → DRAFT.
  async revokeTranslationReview(slug: string, locale: string, user: UserDto) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      const userLocales: string[] = Array.isArray(user.locales)
        ? user.locales
        : [];
      if (!userLocales.includes(locale)) {
        throw new ForbiddenException(
          'You do not have permission to revoke this locale',
        );
      }
    }

    const translation = (
      note.translations as unknown as Record<
        string,
        NoteTranslation | undefined
      >
    )[locale];
    if (
      !translation ||
      translation.status !== TranslationStatus.PENDING_REVIEW
    ) {
      throw new BadRequestException(
        `Translation for ${locale} is not pending review`,
      );
    }

    return this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          [`translations.${locale}.status`]: TranslationStatus.DRAFT,
        },
      },
    );
  }

  // Admin approves a translation — PENDING_REVIEW → APPROVED.
  // Notifies users subscribed to 'publication_ready'.
  async approveTranslation(slug: string, locale: string, user: UserDto) {
    if (!isAdmin(user)) throw new ForbiddenException();

    const note = await this.notesRepository.findOne({ slug });
    const translation = (
      note.translations as unknown as Record<
        string,
        NoteTranslation | undefined
      >
    )[locale];
    if (!translation) {
      throw new BadRequestException(`No ${locale} translation exists yet`);
    }

    const updated = await this.notesRepository.findandUpdate(
      { slug },
      {
        $set: { [`translations.${locale}.status`]: TranslationStatus.APPROVED },
      },
    );

    const emails = await firstValueFrom(
      this.authService.send<string[]>('get_subscriber_emails', {
        subscriptionType: 'publication_ready',
      }),
    );
    if (emails.length > 0) {
      this.notificationsService.emit('note.translation_approved', {
        slug,
        locale,
        title: note.original.title,
        emails,
      });
    }

    return updated;
  }

  // Admin requests a correction on an approved translation — APPROVED → DRAFT.
  // Notifies the translator who submitted the translation.
  async requestTranslationCorrection(
    slug: string,
    locale: string,
    user: UserDto,
  ) {
    if (!isAdmin(user)) throw new ForbiddenException();

    const note = await this.notesRepository.findOne({ slug });
    const translation = (
      note.translations as unknown as Record<
        string,
        NoteTranslation | undefined
      >
    )[locale];
    if (!translation) {
      throw new BadRequestException(`No ${locale} translation exists yet`);
    }
    if (translation.status !== TranslationStatus.APPROVED) {
      throw new BadRequestException(
        `Translation for ${locale} is not approved`,
      );
    }

    const updated = await this.notesRepository.findandUpdate(
      { slug },
      {
        $set: { [`translations.${locale}.status`]: TranslationStatus.DRAFT },
      },
    );

    if (translation.translatedBy) {
      const emails = await firstValueFrom(
        this.authService.send<string[]>('get_user_emails_by_ids', {
          ids: [translation.translatedBy],
        }),
      );
      if (emails.length > 0) {
        this.notificationsService.emit(
          'note.translation_correction_requested',
          {
            slug,
            locale,
            title: note.original.title,
            emails,
          },
        );
      }
    }

    return updated;
  }

  // Moves an article through the editorial workflow.
  //
  // AUTHOR can:   DRAFT → REVIEW (own articles only)
  // ADMIN can:    any transition
  //
  // REVIEW → PUBLISHED requires an approved (or at least draft) EN translation.
  // Admin can publish with AI draft (status: DRAFT) — forced publish without translator approval.
  async updateStatus(slug: string, dto: UpdateNoteStatusDto, user: UserDto) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      if (note.authorId !== user._id) {
        throw new ForbiddenException();
      }
      // Author can send draft to review or revoke review back to draft
      const allowed =
        (note.status === NoteStatus.DRAFT &&
          dto.status === NoteStatus.REVIEW) ||
        (note.status === NoteStatus.REVIEW && dto.status === NoteStatus.DRAFT);
      if (!allowed) {
        throw new ForbiddenException();
      }
    }

    if (
      dto.status === NoteStatus.PUBLISHED &&
      !(note.translations as unknown as Record<string, unknown>)['en']
    ) {
      throw new BadRequestException(
        'Cannot publish without an English translation',
      );
    }

    const publishedAt =
      dto.status === NoteStatus.PUBLISHED
        ? new Date()
        : dto.status === NoteStatus.DRAFT
          ? null
          : note.publishedAt;

    const updated = await this.notesRepository.findandUpdate(
      { slug },
      { $set: { status: dto.status, publishedAt } },
    );

    // When sent to review — trigger AI translation + notify translators per locale
    if (dto.status === NoteStatus.REVIEW) {
      const { supportedLocales } = await this.settingsService.getSettings();
      const existingTranslations = note.translations as unknown as Record<
        string,
        unknown
      >;

      for (const locale of supportedLocales) {
        if (locale === 'uk') continue;

        // Fire-and-forget AI translation for locales without an existing translation
        if (!existingTranslations[locale]) {
          this.runAiTranslation(slug, note.original, locale).catch(
            (err: unknown) =>
              this.logger.error({
                event: 'AI_TRANSLATION_FAILED',
                slug,
                locale,
                err,
              }),
          );
        }

        // Notify translators subscribed to this locale
        const emails = await firstValueFrom(
          this.authService.send<string[]>('get_subscriber_emails', {
            subscriptionType: `translation_needed:${locale}`,
          }),
        );
        if (emails.length > 0) {
          this.notificationsService.emit('note.sent_to_review', {
            slug,
            locale,
            title: note.original.title,
            emails,
          });
        }
      }
    }

    return updated;
  }

  // Deletes an article.
  // ADMIN — can delete anything.
  // AUTHOR — can only delete own DRAFT articles.
  async remove(slug: string, user: UserDto) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      if (note.authorId !== user._id) throw new ForbiddenException();
      if (note.status !== NoteStatus.DRAFT) {
        throw new ForbiddenException('Cannot delete a non-draft article');
      }
    }

    return this.notesRepository.findOneAndDelete({ slug });
  }
}
