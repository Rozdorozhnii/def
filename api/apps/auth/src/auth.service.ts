import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  JwtAccessPayload,
  NOTIFICATIONS_SERVICE,
  sha256,
  UserDocument,
} from '@app/common';
import { TokenPayload } from './interfaces/token-payload';
import { SessionRepository } from './session.repository';
import { UsersRepository } from './users/users.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
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
      role: user.role ?? null,
      locales: user.locales ?? [],
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
    const newSession = await this.sessionRepository.create({
      userId: new Types.ObjectId(decoded.userId),
      refreshTokenHash: '',
      userAgent: req.headers['user-agent'] ?? 'unknown',
      expiresAt: this.calcRefreshExpiry(),
    });

    const payload: TokenPayload = {
      userId: decoded.userId,
      sessionId: newSession._id.toHexString(),
      role: decoded.role,
      locales: decoded.locales ?? [],
    };

    const newAccess = this.signAccessToken(payload);
    const newRefresh = this.signRefreshToken(payload);

    await this.sessionRepository.updateRefreshHash(
      new Types.ObjectId(payload.sessionId),
      sha256(newRefresh),
    );

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

  async verifyEmail(token: string, req: Request, res: Response) {
    const hashed = sha256(token);

    const user = await this.usersRepository.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException('Token expired');
    }

    await this.usersRepository.findandUpdate(
      { _id: user._id },
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    );

    await this.login(user, res, req.headers['user-agent'] ?? 'unknown');
  }

  async authenticate(accessToken: string) {
    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(accessToken, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      });

      const user = await this.usersRepository.findOne({
        _id: payload.userId,
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        _id: user._id.toHexString(),
        email: user.email,
        role: user.role ?? null,
        locales: user.locales ?? [],
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  // Do not throw if email not found — avoids leaking whether the account exists
  async forgotPassword(email: string): Promise<void> {
    let user: UserDocument | null = null;

    try {
      user = await this.usersRepository.findOne({ email });
    } catch {
      return;
    }

    const rawToken = randomBytes(32).toString('hex');

    await this.usersRepository.findandUpdate(
      { _id: user._id },
      {
        passwordResetToken: sha256(rawToken),
        passwordResetExpires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    );

    this.notificationsService.emit('reset_password', {
      email: user.email,
      resetToken: rawToken,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOneOrNull({
      passwordResetToken: sha256(token),
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.usersRepository.findandUpdate(
      { _id: user._id },
      {
        password: await bcryptjs.hash(newPassword, 10),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    );

    // Revoke all active sessions — forces re-login on all devices after password change
    await this.sessionRepository.revokeAllByUser(user._id);
  }

  // Returns emails of all users subscribed to the given subscription type.
  async getSubscriberEmails(subscriptionType: string): Promise<string[]> {
    const users = await this.usersRepository.find({
      subscriptions: subscriptionType,
    });
    return users.map((u) => u.email);
  }

  // Returns emails for a list of user IDs.
  async getUserEmailsByIds(ids: string[]): Promise<string[]> {
    const users = await this.usersRepository.find({
      _id: { $in: ids },
    });
    return users.map((u) => u.email);
  }
}
