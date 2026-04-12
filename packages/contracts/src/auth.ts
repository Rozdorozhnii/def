export const USER_ROLES = ['author', 'translator', 'admin', 'super_admin'] as const;
export type UserRole = typeof USER_ROLES[number];

export const ROLE_LABEL: Record<UserRole, string> = {
  author: 'Author',
  translator: 'Translator',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  role: UserRole | null;
}
