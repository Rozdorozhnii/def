import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

import { NotesModule } from './notes.module';
import { buildCorsOptions } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(NotesModule);
  const configService = app.get(ConfigService);
  app.enableCors(buildCorsOptions(configService));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger)); // Optional: Set up a logger if needed
  app.use(cookieParser());
  await app.listen(configService.getOrThrow<number>('PORT'));
}

void bootstrap();
