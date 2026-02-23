import {
  Body,
  Controller,
  Get,
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
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser, getCookie, UserDocument } from '@app/common';
import { RequestWithAuthCookies } from './strategies/jwt.strategy';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO change it to @nestjs/terminus health check in the future
  @Get('health')
  health() {
    return { status: 'ok' };
  }

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

  @MessagePattern('authenticate')
  authenticate(@Payload() data: { accessToken: string }) {
    return this.authService.authenticate(data.accessToken);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email and auto login' })
  @ApiResponse({ status: 204, description: 'Email verified' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.verifyEmail(verifyEmailDto.token, req, res);
  }
}
