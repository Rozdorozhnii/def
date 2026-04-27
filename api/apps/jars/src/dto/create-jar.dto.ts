import { IsString, IsInt, Min, IsIn, IsOptional } from 'class-validator';

export class CreateJarDto {
  @IsString()
  jarId: string;

  @IsOptional()
  @IsString()
  rootJarId?: string;

  @IsIn(['own', 'friendly'])
  type: 'own' | 'friendly';

  @IsString()
  title: string;

  @IsInt()
  @Min(1)
  goal: number; // UAH
}
