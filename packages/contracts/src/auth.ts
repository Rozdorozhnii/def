export type UserRole = 'super_admin' | 'admin' | 'author' | 'translator';

export interface AuthUser {
  id: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole | null;
}
