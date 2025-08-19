import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AbstractRepository } from '@app/common';
import { NoteDocument } from './models/note.schema';

@Injectable()
export class NotesRepository extends AbstractRepository<NoteDocument> {
  protected readonly logger = new Logger(NotesRepository.name);

  constructor(@InjectModel(NoteDocument.name) noteModel: Model<NoteDocument>) {
    super(noteModel);
  }
}
