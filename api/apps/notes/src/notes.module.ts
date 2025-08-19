import { Module } from '@nestjs/common';

import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { DatabaseModule, LoggerModule } from '@app/common';
import { NotesRepository } from './notes.repository';
import { NoteDocument, NoteSchema } from './models/note.schema';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      {
        name: NoteDocument.name,
        schema: NoteSchema,
      },
    ]),
    LoggerModule,
  ],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}
