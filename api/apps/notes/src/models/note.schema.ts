import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class NoteDocument extends AbstractDocument {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  timestamp: Date;

  @Prop()
  userId: string;
}

export const NoteSchema = SchemaFactory.createForClass(NoteDocument);
