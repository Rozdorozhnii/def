import { UserRole } from '../enums';

export interface UserDto {
  _id: string;
  email: string;
  role: UserRole | null;
}
