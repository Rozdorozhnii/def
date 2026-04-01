import { IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsStrongPassword()
  newPassword: string;
}
