import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';

export enum JarStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum JarType {
  OWN = 'own',
  FRIENDLY = 'friendly',
}

@Schema({ versionKey: false })
export class JarDocument extends AbstractDocument {
  @Prop({ required: true })
  jarId: string; // public ID: send.monobank.ua/jar/{jarId} — donation link

  @Prop({ type: String, default: null })
  rootJarId: string | null; // friendly only: main jar ID for polling + progress bar

  @Prop({ type: String, enum: JarType, required: true })
  type: JarType; // own → webhook; friendly → polling

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  goal: number; // UAH — for display on frontend

  @Prop({ default: 0 })
  balance: number; // UAH, updated via webhook (own) or polling (friendly)

  @Prop({ required: true })
  order: number; // queue position

  @Prop({ type: String, enum: JarStatus, default: JarStatus.PENDING })
  status: JarStatus;

  @Prop({ type: Date, default: null })
  activatedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const JarSchema = SchemaFactory.createForClass(JarDocument);
