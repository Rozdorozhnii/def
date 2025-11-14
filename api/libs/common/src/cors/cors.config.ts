import { ConfigService } from '@nestjs/config';

export function buildCorsOptions(config: ConfigService) {
  const originsString = config.getOrThrow<string>('CORS_ORIGINS');
  const origins = originsString
    ? originsString.split(',').map((o) => o.trim())
    : [];

  return {
    origin: origins,
    credentials: true,
  };
}
