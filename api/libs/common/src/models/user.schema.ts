import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AbstractDocument } from '@app/common';
import { UserRole } from '../enums';

@Schema({ versionKey: false })
export class UserDocument extends AbstractDocument {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, default: null })
  emailVerificationToken: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationExpires: Date | null;

  @Prop({ type: String, default: null })
  passwordResetToken: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpires: Date | null;

  @Prop({ type: String, default: null })
  firstName: string | null;

  @Prop({ type: String, default: null })
  lastName: string | null;

  @Prop({ type: String, default: null })
  pendingEmail: string | null;

  @Prop({ type: String, default: null })
  pendingEmailToken: string | null;

  @Prop({ type: Date, default: null })
  pendingEmailExpires: Date | null;

  @Prop({ type: String, enum: UserRole, default: null })
  role: UserRole | null;

  // Internal staff subscriptions for workflow notifications.
  // Possible values: 'translation_needed:en', 'translation_needed:de', 'publication_ready'
  // Only ADMIN / SUPER_ADMIN may subscribe to 'publication_ready'.
  @Prop({ type: [String], default: [] })
  subscriptions: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
