import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UsersService } from '../users/users.service';
import { TokenPayload } from '../interfaces/token-payload';

interface RequestWithCookies extends Request {
  cookies: {
    Authentication?: string;
  };
  Authentication?: string;
}

const cookieExtractor = (request: RequestWithCookies): string | null => {
  if (typeof request.cookies?.Authentication === 'string') {
    return request.cookies.Authentication;
  }

  if (typeof request.Authentication === 'string') {
    return request.Authentication;
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload) {
    return this.usersService.getUser({ _id: userId });
  }
}
