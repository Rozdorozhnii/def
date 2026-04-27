import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule, LoggerModule, AUTH_SERVICE } from '@app/common';
import { JarsController } from './jars.controller';
import { JarsService } from './jars.service';
import { JarsRepository } from './jars.repository';
import { CollectionsRepository } from './collections.repository';
import { JarDocument, JarSchema } from './models/jar.schema';
import { CollectionDocument, CollectionSchema } from './models/collection.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: JarDocument.name, schema: JarSchema },
      { name: CollectionDocument.name, schema: CollectionSchema },
    ]),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
        MONOBANK_TOKEN: Joi.string().required(),
        PUBLIC_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        ISR_SECRET: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('AUTH_HOST'),
            port: configService.getOrThrow<number>('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [JarsController],
  providers: [JarsService, JarsRepository, CollectionsRepository],
})
export class JarsModule {}
