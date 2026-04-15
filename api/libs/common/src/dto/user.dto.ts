import { UserRole } from '../enums';

export interface UserDto {
  _id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole | null;
  locales: string[];
}
