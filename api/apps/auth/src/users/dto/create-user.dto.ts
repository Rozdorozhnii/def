import { IsEmail, IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string | null;
}
