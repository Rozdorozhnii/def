import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { GetUserDto } from './dto/get-user.dto';
import { NOTIFICATIONS_SERVICE, sha256, UserRole } from '@app/common';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  // Runs once after the app starts.
  // Creates the first SUPER_ADMIN if BOOTSTRAP_ADMIN_EMAIL and
  // BOOTSTRAP_ADMIN_PASSWORD are set in env and no super_admin exists yet.
  // Remove the env vars after the first deploy — bootstrap won't run again
  // once any super_admin exists.
  async onApplicationBootstrap() {
    const email = this.configService.get<string>('BOOTSTRAP_ADMIN_EMAIL');
    const password = this.configService.get<string>('BOOTSTRAP_ADMIN_PASSWORD');

    if (!email || !password) return;

    try {
      await this.usersRepository.findOne({ role: UserRole.SUPER_ADMIN });
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;

      await this.usersRepository.create({
        email,
        password: await bcryptjs.hash(password, 10),
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        firstName: null,
        lastName: null,
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailExpires: null,
        role: UserRole.SUPER_ADMIN,
        subscriptions: [],
        locales: [],
      });

      this.logger.log(`Bootstrap: super_admin created (${email})`);
    }
  }

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
      passwordResetToken: null,
      passwordResetExpires: null,
      firstName: createUserDto.firstName ?? null,
      lastName: createUserDto.lastName ?? null,
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailExpires: null,
      role: null,
      subscriptions: [],
      locales: [],
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

  // Returns all users. SUPER_ADMIN only — enforced at the controller level.
  async findAll() {
    return this.usersRepository.find({});
  }

  // Finds a single user by email. Throws 404 if not found.
  // SUPER_ADMIN only — enforced at the controller level.
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  async updateProfile(
    userId: string,
    firstName: string | null,
    lastName: string | null,
  ) {
    return this.usersRepository.findandUpdate(
      { _id: userId },
      { $set: { firstName, lastName } },
    );
  }

  async requestEmailChange(userId: string, newEmail: string) {
    await this.validateUserEmail(newEmail);

    const rawToken = randomBytes(32).toString('hex');

    await this.usersRepository.findandUpdate(
      { _id: userId },
      {
        $set: {
          pendingEmail: newEmail,
          pendingEmailToken: sha256(rawToken),
          pendingEmailExpires: new Date(Date.now() + 1000 * 60 * 60), // 1h
        },
      },
    );

    this.notificationsService.emit('verify_email', {
      email: newEmail,
      verificationToken: rawToken,
      isEmailChange: true,
    });
  }

  async confirmEmailChange(token: string) {
    const user = await this.usersRepository.findOneOrNull({
      pendingEmailToken: sha256(token),
      pendingEmailExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.usersRepository.findandUpdate(
      { _id: user._id },
      {
        $set: {
          email: user.pendingEmail,
          pendingEmail: null,
          pendingEmailToken: null,
          pendingEmailExpires: null,
        },
      },
    );
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository.findById(userId);
    const isValid = await bcryptjs.compare(currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersRepository.findandUpdate(
      { _id: userId },
      { $set: { password: await bcryptjs.hash(newPassword, 10) } },
    );
  }

  // Assigns a role to a user by id.
  // Only SUPER_ADMIN can call this — enforced at the controller level.
  async assignRole(userId: string, role: UserRole | null) {
    return this.usersRepository.findandUpdate(
      { _id: userId },
      { $set: { role } },
    );
  }

  // Assigns translation locales to a user by id.
  // Only SUPER_ADMIN can call this — enforced at the controller level.
  async assignLocales(userId: string, locales: string[]) {
    return this.usersRepository.findandUpdate(
      { _id: userId },
      { $set: { locales } },
    );
  }

  // Returns emails for a list of user IDs.
  // Used by notes service to notify a specific translator.
  async getUserEmailsByIds(ids: string[]): Promise<string[]> {
    const users = await this.usersRepository.find({
      _id: { $in: ids },
    });
    return users.map((u) => u.email);
  }
}
