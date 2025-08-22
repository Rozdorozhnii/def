import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

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
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
  ],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}
