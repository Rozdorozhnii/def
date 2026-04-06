import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateNoteDto } from './dto/create-note.dto';
import {
  UpsertTranslationDto,
  UpdateNoteStatusDto,
} from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { NoteStatus } from './models/note.schema';
import { UserDto, UserRole } from '@app/common';

// Maps each Cyrillic character to its Latin equivalent for URL-safe slugs.
// Used only for Ukrainian originals — English titles are already Latin.
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
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join('');
}

// Converts a title to a URL-safe slug.
// Ukrainian: transliterate first, then sanitize.
// e.g. "Військо потребує допомоги!" → "vijsko-potrebuie-dopomohy"
function toSlug(title: string): string {
  return transliterate(title)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// For English titles — already Latin, just sanitize.
// e.g. "Army needs help!" → "army-needs-help"
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
  constructor(private readonly notesRepository: NotesRepository) {}

  // Creates a new article draft with the Ukrainian original.
  // Only AUTHOR (and ADMIN acting as author) can call this.
  // Slug is auto-generated from the Ukrainian title and must be unique.
  async create(dto: CreateNoteDto, user: UserDto) {
    const slug = toSlug(dto.title);

    const existing = await this.notesRepository
      .findOne({ slug })
      .catch((err: unknown) => {
        if (err instanceof NotFoundException) return null;
        throw err;
      });

    if (existing) {
      throw new BadRequestException(`Slug "${slug}" already exists`);
    }

    return this.notesRepository.create({
      slug,
      status: NoteStatus.DRAFT,
      authorId: user._id,
      publishedAt: null,
      translations: {
        // translatedBy: null means this is the original (written by the author, not a translator)
        uk: {
          title: dto.title,
          description: dto.description,
          body: dto.body,
          translatedBy: null,
        },
      },
    });
  }

  // Public endpoint — no auth required.
  // Returns only PUBLISHED articles visible to site visitors.
  findPublished() {
    return this.notesRepository.find({ status: NoteStatus.PUBLISHED });
  }

  // Public endpoint — returns a single published article by slug.
  // Throws NotFoundException (404) if not found or not published.
  findOnePublished(slug: string) {
    return this.notesRepository.findOne({
      slug,
      status: NoteStatus.PUBLISHED,
    });
  }

  // Returns articles filtered by role:
  //   ADMIN / SUPER_ADMIN — all articles regardless of status or author
  //   AUTHOR              — only own articles (all statuses)
  //   TRANSLATOR          — only articles in REVIEW (ready to translate)
  findAll(user: UserDto) {
    if (isAdmin(user)) {
      return this.notesRepository.find({});
    }
    if (user.role === UserRole.AUTHOR) {
      return this.notesRepository.find({ authorId: user._id });
    }
    if (user.role === UserRole.TRANSLATOR) {
      return this.notesRepository.find({ status: NoteStatus.REVIEW });
    }
    throw new ForbiddenException();
  }

  // Returns a single article by slug for the admin panel.
  // Access rules are enforced at the controller level via RolesGuard.
  findOne(slug: string) {
    return this.notesRepository.findOne({ slug });
  }

  // Adds or updates a translation for a specific locale.
  //
  // Who can edit which locale:
  //   'uk' → only the article's own author (or ADMIN)
  //   'en' → TRANSLATOR, the article's author, or ADMIN
  //
  // When an English translation is added, the slug is updated from en.title
  // (better URLs for western audience: "army-needs-help" > "vijsko-potrebuie-dopomohy").
  async upsertTranslation(
    slug: string,
    dto: UpsertTranslationDto,
    user: UserDto,
  ) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      if (dto.locale === 'uk') {
        if (note.authorId !== user._id) {
          throw new ForbiddenException(
            'Only the author can edit the Ukrainian translation',
          );
        }
      } else {
        const isTranslator = user.role === UserRole.TRANSLATOR;
        const isAuthor = note.authorId === user._id;
        if (!isTranslator && !isAuthor) {
          throw new ForbiddenException(
            'Only a translator or the author can add an English translation',
          );
        }
      }
    }

    // translatedBy is null for original content (author editing their own locale).
    // Set to user._id when a translator or admin adds the translation.
    const translatedBy =
      note.authorId === user._id && dto.locale === 'uk' ? null : user._id;

    const newSlug = dto.locale === 'en' ? sanitizeSlug(dto.title) : slug;

    return this.notesRepository.findandUpdate(
      { slug },
      {
        $set: {
          slug: newSlug,
          [`translations.${dto.locale}`]: {
            title: dto.title,
            description: dto.description,
            body: dto.body,
            translatedBy,
          },
        },
      },
    );
  }

  // Moves an article through the editorial workflow.
  // Only ADMIN / SUPER_ADMIN can change status.
  //
  // Rules:
  //   DRAFT → REVIEW     — always allowed
  //   REVIEW → PUBLISHED — requires an English translation to exist
  //   * → DRAFT          — resets publishedAt (archiving)
  async updateStatus(slug: string, dto: UpdateNoteStatusDto, user: UserDto) {
    if (!isAdmin(user)) {
      throw new ForbiddenException();
    }

    const note = await this.notesRepository.findOne({ slug });

    if (dto.status === NoteStatus.PUBLISHED && !note.translations?.en) {
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

    return this.notesRepository.findandUpdate(
      { slug },
      { $set: { status: dto.status, publishedAt } },
    );
  }

  // Deletes an article.
  //
  // ADMIN / SUPER_ADMIN — can delete anything.
  // AUTHOR              — can only delete own articles that are still DRAFT
  //                       (prevents silent removal of published content).
  async remove(slug: string, user: UserDto) {
    const note = await this.notesRepository.findOne({ slug });

    if (!isAdmin(user)) {
      if (note.authorId !== user._id) {
        throw new ForbiddenException();
      }
      if (note.status !== NoteStatus.DRAFT) {
        throw new ForbiddenException('Cannot delete a non-draft article');
      }
    }

    return this.notesRepository.findOneAndDelete({ slug });
  }
}
