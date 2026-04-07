import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UsersService } from './users.service';
import { CurrentUser, UserDocument, RolesGuard, Roles, UserRole } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Returns the currently authenticated user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: UserDocument) {
    return new UserResponseDto(user);
  }

  // Returns all users, or a single user if ?email= is provided. SUPER_ADMIN only.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(@Query('email') email?: string) {
    if (email) {
      const user = await this.usersService.findByEmail(email);
      return new UserResponseDto(user);
    }

    const users = await this.usersService.findAll();
    return users.map((u) => new UserResponseDto(u));
  }

  // Assigns or removes a role for any user. SUPER_ADMIN only.
  // Pass role: null to revoke all staff access.
  @Patch(':id/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async assignRole(
    @Param('id') id: string,
    @Body() { role }: AssignRoleDto,
  ) {
    await this.usersService.assignRole(id, role ?? null);
  }
}
