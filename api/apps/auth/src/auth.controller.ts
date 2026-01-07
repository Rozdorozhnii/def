import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedUser, CurrentUser, UserDocument } from '@app/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { getCookie, RequestWithAuthCookies } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserDocument,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : 'unknown';

    await this.authService.login(user, response, userAgent);

    return {
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refresh(
    @Req() req: RequestWithAuthCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = getCookie(req, 'Refresh');

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    await this.authService.refresh(refreshToken, req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: RequestWithAuthCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = getCookie(req, 'Refresh');

    if (refreshToken) {
      await this.authService.logout(refreshToken, res);
    }
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  authenticate(@Payload() data: { user: AuthenticatedUser }) {
    return data.user;
  }
}
