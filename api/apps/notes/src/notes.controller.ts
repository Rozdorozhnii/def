import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CurrentUser, AccessTokenGuard, UserDto } from '@app/common';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  async findAll() {
    return this.notesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.notesService.update(id, updateNoteDto, user);
  }
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: UserDto) {
    return this.notesService.remove(id, user);
  }
}
