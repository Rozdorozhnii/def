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

  // Locales the translator is allowed to work on (e.g. ['en', 'de']).
  // Empty for AUTHOR, ADMIN, SUPER_ADMIN — they have unrestricted access.
  @Prop({ type: [String], default: [] })
  locales: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
