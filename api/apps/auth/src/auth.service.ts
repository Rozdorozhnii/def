import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { sha256, UserDocument } from '@app/common';
import { TokenPayload } from './interfaces/token-payload';
import { SessionRepository } from './session.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private signAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRATION'),
    });
  }

  private signRefreshToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION'),
    });
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      maxAge: this.configService.getOrThrow('JWT_ACCESS_EXPIRATION') * 1000,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      maxAge: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION') * 1000,
    });
  }

  private calcRefreshExpiry() {
    return new Date(
      Date.now() +
        Number(this.configService.getOrThrow('JWT_REFRESH_EXPIRATION')) * 1000,
    );
  }

  async login(user: UserDocument, res: Response, userAgent: string) {
    const session = await this.sessionRepository.create({
      userId: user._id,
      refreshTokenHash: '',
      userAgent,
      expiresAt: this.calcRefreshExpiry(),
    });

    const payload: TokenPayload = {
      userId: user._id.toHexString(),
      sessionId: session._id.toHexString(),
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    await this.sessionRepository.updateRefreshHash(
      session._id,
      sha256(refreshToken),
    );

    this.setAuthCookies(res, accessToken, refreshToken);
  }

  async refresh(refreshToken: string, req: Request, res: Response) {
    let decoded: TokenPayload & { iat: number; exp: number };

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    const session = await this.sessionRepository.takeActiveSessionById(
      new Types.ObjectId(decoded.sessionId),
    );

    if (!session) {
      // 🔥 HARD BREACH
      await this.sessionRepository.revokeAllByUser(
        new Types.ObjectId(decoded.userId),
      );

      this.logger.error({
        event: 'REFRESH_REUSE_DETECTED',
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        ip: req.ip,
        ua: req.headers['user-agent'],
      });

      throw new UnauthorizedException();
    }

    // UA mismatch → revoke only this session
    if (session.userAgent !== req.headers['user-agent']) {
      await this.sessionRepository.revokeBySessionId(session._id);
      throw new UnauthorizedException();
    }

    // ROTATION
    await this.sessionRepository.revokeBySessionId(session._id);

    const payload: TokenPayload = {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };

    const newAccess = this.signAccessToken(payload);
    const newRefresh = this.signRefreshToken(payload);

    await this.sessionRepository.create({
      userId: new Types.ObjectId(payload.userId),
      refreshTokenHash: sha256(newRefresh),
      userAgent: req.headers['user-agent'] ?? 'unknown',
      expiresAt: this.calcRefreshExpiry(),
    });

    this.setAuthCookies(res, newAccess, newRefresh);
  }

  async logout(refresh: string, res: Response) {
    const result = await this.sessionRepository.revokeByRefreshHash(
      sha256(refresh),
    );
    if (result.modifiedCount === 0) {
      this.logger.warn('Logout with invalid refresh token');
    }

    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
  }
}
