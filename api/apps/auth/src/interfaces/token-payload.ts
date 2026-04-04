import { UserRole } from '@app/common';

export interface TokenPayload {
  userId: string;
  sessionId: string;
  role: UserRole | null;
}
