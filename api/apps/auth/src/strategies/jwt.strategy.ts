import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UsersService } from '../users/users.service';
import { TokenPayload } from '../interfaces/token-payload';

export interface RequestWithAuthCookies extends Request {
  cookies: {
    Authentication?: string;
    Refresh?: string;
  };
}

export const accessTokenExtractor = (
  request: RequestWithAuthCookies,
): string | null => {
  return typeof request.cookies?.Authentication === 'string'
    ? request.cookies.Authentication
    : null;
};

export const getCookie = (
  req: Request,
  name: 'Authentication' | 'Refresh',
): string | null =>
  typeof req.cookies?.[name] === 'string' ? req.cookies[name] : null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([accessTokenExtractor]),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    return this.usersService.getUser({ _id: payload.userId });
  }
}
