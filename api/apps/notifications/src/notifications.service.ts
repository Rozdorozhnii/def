import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

import {
  NotifyEmailDto,
  ResetPasswordNotifyDto,
  VerifyEmailDto,
  NoteSentToReviewDto,
  NoteSentForTranslationDto,
  NoteTranslationSubmittedDto,
  NoteTranslationApprovedDto,
  NoteTranslationCorrectionRequestedDto,
  NoteTranslationCorrectionSubmittedDto,
} from './dto';

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
      // Allow self-signed certs in dev (corporate proxies / VPN with SSL inspection)
      ...(this.configService.get('NODE_ENV') !== 'production' && {
        tls: { rejectUnauthorized: false },
      }),
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

  async noteSentToReview({ slug, title, emails }: NoteSentToReviewDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `Article submitted for review: ${title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">New article awaiting review</h2>
                  <p>The article <strong>${title}</strong> has been submitted for your review.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Review article
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `New article awaiting review: ${title}\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async noteSentForTranslation({ slug, title, emails }: NoteSentForTranslationDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `New article ready for translation: ${title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">New article needs translation</h2>
                  <p>The article <strong>${title}</strong> has been sent to review and is ready for translation.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Open article
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `New article needs translation: ${title}\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async noteTranslationSubmitted({ slug, title, locale, emails }: NoteTranslationSubmittedDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `Translation submitted for review: ${title} (${locale})`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">Translation ready for approval</h2>
                  <p>The <strong>${locale.toUpperCase()}</strong> translation of <strong>${title}</strong> has been submitted and is awaiting your approval.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Review translation
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `Translation submitted: ${title} (${locale})\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async noteTranslationApproved({ slug, title, locale, emails }: NoteTranslationApprovedDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `Translation approved — ready to publish: ${title} (${locale})`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">Article ready to publish</h2>
                  <p>The <strong>${locale.toUpperCase()}</strong> translation of <strong>${title}</strong> has been approved and the article is ready to publish.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Publish article
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `Translation approved: ${title} (${locale})\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async noteTranslationCorrectionRequested({ slug, title, locale, emails }: NoteTranslationCorrectionRequestedDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `Correction requested for translation: ${title} (${locale})`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">Correction requested</h2>
                  <p>An admin has requested a correction for your <strong>${locale.toUpperCase()}</strong> translation of <strong>${title}</strong>.</p>
                  <p>The translation has been returned to draft status for editing.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Edit translation
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `Correction requested: ${title} (${locale})\n\nAn admin has requested a correction. The translation has been returned to draft.\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async noteTranslationCorrectionSubmitted({ slug, title, locale, emails }: NoteTranslationCorrectionSubmittedDto): Promise<void> {
    const frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
    await Promise.all(
      emails.map((email) =>
        this.transporter.sendMail({
          from: this.configService.getOrThrow('SMTP_USER'),
          to: email,
          subject: `Correction submitted for review: ${title} (${locale})`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8" /></head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
              <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
                <tr><td>
                  <h2 style="margin-top: 0;">Correction ready for approval</h2>
                  <p>The corrected <strong>${locale.toUpperCase()}</strong> translation of <strong>${title}</strong> has been submitted and is awaiting your approval.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${frontendUrl}/admin/notes/${slug}"
                      style="background-color: #ff4102; color: white; padding: 12px 24px;
                             text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Review correction
                    </a>
                  </div>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          text: `Correction submitted: ${title} (${locale})\n\n${frontendUrl}/admin/notes/${slug}`,
        }),
      ),
    );
  }

  async verifyEmail({
    email,
    verificationToken,
    isEmailChange = false,
  }: VerifyEmailDto) {
    const verifyUrl = isEmailChange
      ? `${this.configService.getOrThrow('FRONTEND_URL')}/profile/confirm-email?token=${verificationToken}`
      : `${this.configService.getOrThrow('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    const subject = isEmailChange
      ? 'Confirm your new email'
      : 'Verify your email';
    const heading = isEmailChange
      ? 'Confirm your new email'
      : 'Confirm your email';
    const description = isEmailChange
      ? 'Click the button below to confirm this email address for your account.'
      : 'Thanks for registering. Please confirm your email address by clicking the button below.';
    const buttonText = isEmailChange ? 'Confirm Email' : 'Verify Email';
    const footer = isEmailChange
      ? "This link expires in 1 hour. If you didn't request this change, ignore this email."
      : "This link expires in 1 hour. If you didn't create an account, ignore this email.";

    await this.transporter.sendMail({
      from: this.configService.getOrThrow('SMTP_USER'),
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /><title>${subject}</title></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <table width="100%" style="max-width:600px; margin: auto; background: white; padding: 32px; border-radius: 8px;">
            <tr><td>
              <h2 style="margin-top: 0;">${heading}</h2>
              <p>${description}</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}"
                  style="background-color: #ff4102; color: white; padding: 12px 24px;
                         text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${buttonText}
                </a>
              </div>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all;">${verifyUrl}</p>
              <hr style="margin: 32px 0;" />
              <p style="font-size: 12px; color: #666;">${footer}</p>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `${heading}\n\n${description}\n\n${verifyUrl}\n\n${footer}`,
    });
  }
}
