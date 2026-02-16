import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { GetUserDto } from './dto/get-user.dto';
import { NOTIFICATIONS_SERVICE, sha256 } from '@app/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  async validateUserEmail(email: string) {
    try {
      const user = await this.usersRepository.findOne({ email });
      if (user) {
        throw new ConflictException('User with this email already exists');
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        return;
      }
      throw err;
    }
  }

  async create(createUserDto: CreateUserDto) {
    await this.validateUserEmail(createUserDto.email);

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = sha256(rawToken);

    const user = await this.usersRepository.create({
      email: createUserDto.email,
      password: await bcryptjs.hash(createUserDto.password, 10),
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60), // 1h
    });

    this.notificationsService.emit('verify_email', {
      email: createUserDto.email,
      verificationToken: rawToken,
    });

    return {
      id: user._id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }
}
