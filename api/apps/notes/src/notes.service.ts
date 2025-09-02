import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';

import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { NOTIFICATIONS_SERVICE, UserDto } from '@app/common';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientGrpcProxy,
  ) {}

  create(createNoteDto: CreateNoteDto, { email, _id: userId }: UserDto) {
    const createdNote = this.notesRepository.create({
      ...createNoteDto,
      timestamp: new Date(),
      userId,
    });

    this.notificationsService.emit('notify_email', {
      email,
      text: `Your note with title ${createNoteDto.title} created successfully`,
    });

    return createdNote;
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

  remove(_id: string) {
    return this.notesRepository.findOneAndDelete({ _id });
  }
}
