import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { Request } from 'express';

import { AUTH_SERVICE } from '../constants/services';
import { UserDto } from '../dto';

interface RequestWithUser extends Request {
  user?: UserDto;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const accessToken: string | undefined = (
      req.cookies as { Authentication?: string }
    )?.Authentication;

    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const user = await lastValueFrom(
        this.authClient
          .send<UserDto>('authenticate', { accessToken })
          .pipe(timeout(3000)),
      );

      if (!user) {
        throw new UnauthorizedException();
      }

      req.user = user;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
