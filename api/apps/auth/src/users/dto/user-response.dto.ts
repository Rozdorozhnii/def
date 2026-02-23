import { UserDocument } from '@app/common';

// TODO add implementations AuthUser contract to UserResponseDto, which is used in users.controller.ts to return user data in response to the client. This way we can ensure that the user data returned from the API matches the AuthUser contract used in the frontend.
export class UserResponseDto {
  id: string;
  email: string;
  isEmailVerified: boolean;

  constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.email = user.email;
    this.isEmailVerified = user.isEmailVerified;
  }
}
