import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

import { AccessTokenGuard, RolesGuard, Roles, UserRole } from '@app/common';
import { SettingsService } from './settings.service';

class UpdateLocalesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  supportedLocales: string[];
}

@Controller('notes/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public — frontend needs to know which locales are available
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // Super admin only — manage supported translation locales
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('locales')
  updateLocales(@Body() dto: UpdateLocalesDto) {
    return this.settingsService.updateSupportedLocales(dto.supportedLocales);
  }
}
