import { UserDocument, UserRole } from '@app/common';

export class UserResponseDto {
  id: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole | null;

  constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.email = user.email;
    this.isEmailVerified = user.isEmailVerified;
    this.role = user.role ?? null;
  }
}
