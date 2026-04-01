import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordNotifyDto {
  @IsEmail()
  email: string;

  @IsString()
  resetToken: string;
}
