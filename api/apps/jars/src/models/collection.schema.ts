import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class CollectionDocument extends AbstractDocument {
  @Prop({ required: true })
  jarId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  goal: number; // UAH

  @Prop({ required: true })
  finalBalance: number; // UAH

  @Prop({ required: true })
  activatedAt: Date;

  @Prop({ required: true })
  completedAt: Date;

  @Prop({ type: String, default: null })
  reportUrl: string | null;
}

export const CollectionSchema =
  SchemaFactory.createForClass(CollectionDocument);
