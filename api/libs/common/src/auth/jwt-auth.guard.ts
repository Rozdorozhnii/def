import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';

import { AUTH_SERVICE } from '../constants/services';
import { UserDto } from '../dto';
import { AuthenticatedUser } from '../interfaces';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const jwt: string | undefined = (req.cookies as { Authentication?: string })
      ?.Authentication;

    if (!jwt) {
      return false;
    }

    return this.authClient
      .send<UserDto>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          const req = context.switchToHttp().getRequest<RequestWithUser>();
          req.user = res;
        }),
        map(() => true),
        catchError(() => of(false)),
      );
  }
}
