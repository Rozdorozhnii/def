import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  verificationToken: string;

  @IsBoolean()
  @IsOptional()
  isEmailChange?: boolean;
}
