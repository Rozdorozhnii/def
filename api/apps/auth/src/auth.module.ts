import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { LoggerModule, DatabaseModule } from '@app/common';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionDocument, SessionSchema } from './models/session.schema';
import { SessionRepository } from './session.repository';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      {
        name: SessionDocument.name,
        schema: SessionSchema,
      },
    ]),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),

        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.number().required(),

        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.number().required(),

        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'staging')
          .required(),
      }),
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionRepository],
})
export class AuthModule {}
