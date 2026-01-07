// session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class SessionDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, index: true })
  userId: Types.ObjectId;

  @Prop()
  refreshTokenHash: string;

  @Prop()
  deviceId?: string;

  @Prop()
  userAgent: string;

  @Prop()
  revokedAt?: Date;

  @Prop()
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(SessionDocument);

SessionSchema.index({ refreshTokenHash: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
