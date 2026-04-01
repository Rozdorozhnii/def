import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, Payload } from '@nestjs/microservices';

import { NotifyEmailDto, ResetPasswordNotifyDto, VerifyEmailDto } from './dto';

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
}
