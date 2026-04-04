import { UserRole } from '../enums';

export interface JwtAccessPayload {
  userId: string;
  sessionId: string;
  role: UserRole | null;
}
