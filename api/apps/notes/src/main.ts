import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

import { NotesModule } from './notes.module';

async function bootstrap() {
  const app = await NestFactory.create(NotesModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger)); // Optional: Set up a logger if needed
  await app.listen(process.env.port ?? 3000);
}

void bootstrap();
