import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

import { JarsModule } from './jars.module';

async function bootstrap() {
  const app = await NestFactory.create(JarsModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.getOrThrow<number>('TCP_PORT'),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
