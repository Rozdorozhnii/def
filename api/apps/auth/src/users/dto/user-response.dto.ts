import { UserDocument, UserRole } from '@app/common';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  role: UserRole | null;
  locales: string[];

  constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.email = user.email;
    this.firstName = user.firstName ?? null;
    this.lastName = user.lastName ?? null;
    this.isEmailVerified = user.isEmailVerified;
    this.role = user.role ?? null;
    this.locales = user.locales ?? [];
  }
}
