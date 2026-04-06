import { IsEnum, IsOptional } from 'class-validator';

import { UserRole } from '@app/common';

export class AssignRoleDto {
  // null removes the role (revokes all staff access)
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole | null;
}
