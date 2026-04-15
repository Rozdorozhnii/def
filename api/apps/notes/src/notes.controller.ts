import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import {
  UpdateOriginalDto,
  UpsertTranslationDto,
  UpdateNoteStatusDto,
} from './dto/update-note.dto';
import {
  AccessTokenGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  UserDto,
  UserRole,
} from '@app/common';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  // Public — no auth required. Returns only PUBLISHED articles.
  @Get('published')
  findPublished() {
    return this.notesService.findPublished();
  }

  // Public — returns a single published article by slug.
  @Get('published/:slug')
  findOnePublished(@Param('slug') slug: string) {
    return this.notesService.findOnePublished(slug);
  }

  // Returns articles filtered by the caller's role.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Get()
  findAll(@CurrentUser() user: UserDto) {
    return this.notesService.findAll(user);
  }

  // Creates a draft with the Ukrainian original.
  // TRANSLATOR allowed at guard level; service enforces locales.includes('uk').
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Post()
  create(@Body() dto: CreateNoteDto, @CurrentUser() user: UserDto) {
    return this.notesService.create(dto, user);
  }

  // Returns a single article by slug for the admin panel.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.notesService.findOne(slug);
  }

  // Updates the Ukrainian original content.
  // TRANSLATOR allowed at guard level; service enforces ownership.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Patch(':slug/original')
  updateOriginal(
    @Param('slug') slug: string,
    @Body() dto: UpdateOriginalDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.updateOriginal(slug, dto, user);
  }

  // Adds or updates a translation for a given locale.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Patch(':slug/translations')
  upsertTranslation(
    @Param('slug') slug: string,
    @Body() dto: UpsertTranslationDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.upsertTranslation(slug, dto, user);
  }

  // Translator submits a translation for admin review (DRAFT → PENDING_REVIEW).
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Patch(':slug/translations/:locale/submit')
  submitTranslationForReview(
    @Param('slug') slug: string,
    @Param('locale') locale: string,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.submitTranslationForReview(slug, locale, user);
  }

  // Admin approves a translation (PENDING_REVIEW → APPROVED).
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':slug/translations/:locale/approve')
  approveTranslation(
    @Param('slug') slug: string,
    @Param('locale') locale: string,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.approveTranslation(slug, locale, user);
  }

  // Moves an article through the workflow (DRAFT → REVIEW → PUBLISHED).
  // TRANSLATOR allowed at guard level for sending own articles to review.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(
    UserRole.AUTHOR,
    UserRole.TRANSLATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @Patch(':slug/status')
  updateStatus(
    @Param('slug') slug: string,
    @Body() dto: UpdateNoteStatusDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.updateStatus(slug, dto, user);
  }

  // Deletes an article.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':slug')
  remove(@Param('slug') slug: string, @CurrentUser() user: UserDto) {
    return this.notesService.remove(slug, user);
  }
}
