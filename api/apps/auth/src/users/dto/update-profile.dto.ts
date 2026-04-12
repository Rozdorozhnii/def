import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string | null;
}