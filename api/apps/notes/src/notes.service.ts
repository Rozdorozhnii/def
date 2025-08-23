import { Injectable } from '@nestjs/common';

import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  create(createNoteDto: CreateNoteDto, userId: string) {
    return this.notesRepository.create({
      ...createNoteDto,
      timestamp: new Date(),
      userId,
    });
  }

  findAll() {
    return this.notesRepository.find({});
  }

  findOne(_id: string) {
    return this.notesRepository.findOne({ _id });
  }

  update(_id: string, updateNoteDto: UpdateNoteDto) {
    return this.notesRepository.findandUpdate({ _id }, { $set: updateNoteDto });
  }

  remove(_id: number) {
    return this.notesRepository.findOneAndDelete({ _id });
  }
}
