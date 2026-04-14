import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, Payload } from '@nestjs/microservices';

import {
  NotifyEmailDto,
  ResetPasswordNotifyDto,
  VerifyEmailDto,
  NoteSentToReviewDto,
  NoteTranslationSubmittedDto,
  NoteTranslationApprovedDto,
} from './dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('notify_email')
  async notifyEmail(@Payload() data: NotifyEmailDto) {
    await this.notificationsService.notifyEmail(data);
  }

  @EventPattern('verify_email')
  async verifyEmail(@Payload() data: VerifyEmailDto) {
    await this.notificationsService.verifyEmail(data);
  }

  @EventPattern('reset_password')
  async resetPassword(@Payload() data: ResetPasswordNotifyDto) {
    await this.notificationsService.resetPassword(data);
  }

  @EventPattern('note.sent_to_review')
  async noteSentToReview(@Payload() data: NoteSentToReviewDto) {
    await this.notificationsService.noteSentToReview(data);
  }

  @EventPattern('note.translation_submitted')
  async noteTranslationSubmitted(@Payload() data: NoteTranslationSubmittedDto) {
    await this.notificationsService.noteTranslationSubmitted(data);
  }

  @EventPattern('note.translation_approved')
  async noteTranslationApproved(@Payload() data: NoteTranslationApprovedDto) {
    await this.notificationsService.noteTranslationApproved(data);
  }
}
