import { Request } from 'express';
export const AUTH_COOKIES = {
  access: 'Authentication',
  refresh: 'Refresh',
} as const;

export type AuthCookieName = (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

export const getCookie = (req: Request, name: AuthCookieName): string | null =>
  typeof req.cookies?.[name] === 'string' ? req.cookies[name] : null;
