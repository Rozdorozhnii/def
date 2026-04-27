import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  AccessTokenGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  UserDto,
  UserRole,
} from '@app/common';
import { JarsService } from './jars.service';
import { CreateJarDto } from './dto/create-jar.dto';
import { MonobankWebhookDto } from './dto/monobank-webhook.dto';

@Controller('jars')
export class JarsController {
  constructor(private readonly jarsService: JarsService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  // Public — used by frontend to display active jar on articles
  @Get('active')
  getActive() {
    return this.jarsService.getActiveJar();
  }

  // Monobank calls this directly — no auth
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() payload: MonobankWebhookDto) {
    return this.jarsService.handleWebhook(payload);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  listJars(@CurrentUser() _user: UserDto) {
    return this.jarsService.listJars();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  createJar(@CurrentUser() _user: UserDto, @Body() dto: CreateJarDto) {
    return this.jarsService.createJar(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteJar(@CurrentUser() _user: UserDto, @Param('id') id: string) {
    return this.jarsService.deleteJar(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('collections')
  listCollections(@CurrentUser() _user: UserDto) {
    return this.jarsService.listCollections();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('debug/trigger-completion')
  @HttpCode(HttpStatus.OK)
  debugTriggerCompletion(@CurrentUser() _user: UserDto) {
    return this.jarsService.debugTriggerCompletion();
  }
}
