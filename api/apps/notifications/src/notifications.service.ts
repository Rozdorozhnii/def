import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

import { NotifyEmailDto, ResetPasswordNotifyDto, VerifyEmailDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.getOrThrow('SMTP_USER'),
        clientId: this.configService.getOrThrow('GOOGLE_OAUTH_CLIENT_ID'),
        clientSecret: this.configService.getOrThrow(
          'GOOGLE_OAUTH_CLIENT_SECRET',
        ),
        refreshToken: this.configService.getOrThrow(
          'GOOGLE_OAUTH_REFRESH_TOKEN',
        ),
      },
    });
  }

  async notifyEmail({ email, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow('SMTP_USER'),
      to: email,
      subject: 'Defenders notifications',
      text,
    });
  }

  async resetPassword({ email, resetToken }: ResetPasswordNotifyDto) {
    const resetUrl = `${this.configService.getOrThrow('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow('SMTP_USER'),
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /><title>Password Reset</title></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
            <tr><td>
              <h2 style="margin-top: 0;">Reset your password</h2>
              <p>We received a request to reset your password. Click the button below to choose a new one.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}"
                  style="background-color: #ff4102; color: white; padding: 12px 24px;
                         text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <hr style="margin: 32px 0;" />
              <p style="font-size: 12px; color: #666;">
                This link expires in 15 minutes. If you didn't request a password reset, ignore this email.
              </p>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `Reset your password\n\nClick the link below:\n\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
    });
  }

  async verifyEmail({ email, verificationToken }: VerifyEmailDto) {
    const verifyUrl = `${this.configService.getOrThrow('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    const verificationEmailTemplate = (verifyUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
        <table width="100%" max-width="600px" style="margin: auto; background: white; padding: 32px; border-radius: 8px;">
          <tr>
            <td>
              <h2 style="margin-top: 0;">Confirm your email</h2>
              <p>
                Thanks for registering. Please confirm your email address by clicking the button below.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}"
                  style="background-color: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 6px;
                          font-weight: bold;">
                  Verify Email
                </a>
              </div>

              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all;">
                ${verifyUrl}
              </p>

              <hr style="margin: 32px 0;" />

              <p style="font-size: 12px; color: #666;">
                This link will expire in 1 hour.
                If you didn’t create an account, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;

    const verificationEmailText = (verifyUrl: string) => `
        Confirm your email

        Please verify your email by clicking the link below:

        ${verifyUrl}

        This link expires in 1 hour.

        If you did not create this account, ignore this email.
        `;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow('SMTP_USER'),
      to: email,
      subject: 'Verify your email',
      html: verificationEmailTemplate(verifyUrl),
      text: verificationEmailText(verifyUrl),
    });
  }
}
