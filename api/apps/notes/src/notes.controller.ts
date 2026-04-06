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

// Roles cascade: ADMIN / SUPER_ADMIN can do everything AUTHOR and TRANSLATOR can.
// Fine-grained ownership checks (e.g. "own article only") are handled in the service.

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  // Public — no auth required. Returns only PUBLISHED articles.
  // Must be declared before :slug to avoid "published" being captured as a slug param.
  @Get('published')
  findPublished() {
    return this.notesService.findPublished();
  }

  // Public — returns a single published article by slug (for the public article page).
  @Get('published/:slug')
  findOnePublished(@Param('slug') slug: string) {
    return this.notesService.findOnePublished(slug);
  }

  // Returns articles filtered by the caller's role (see NotesService.findAll).
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
  // ADMIN can also create articles (acts as author).
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateNoteDto, @CurrentUser() user: UserDto) {
    return this.notesService.create(dto, user);
  }

  // Adds or updates a translation for a given locale.
  // ADMIN bypasses ownership checks in the service.
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

  // Moves an article through the workflow (DRAFT → REVIEW → PUBLISHED).
  // Only admins can change status.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':slug/status')
  updateStatus(
    @Param('slug') slug: string,
    @Body() dto: UpdateNoteStatusDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.updateStatus(slug, dto, user);
  }

  // Returns a single article by slug for the admin panel / editor views.
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

  // Deletes an article. Service enforces: author can only delete own DRAFT articles.
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':slug')
  remove(@Param('slug') slug: string, @CurrentUser() user: UserDto) {
    return this.notesService.remove(slug, user);
  }
}
