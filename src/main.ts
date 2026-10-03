import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  });

  // Signature PNGs from the house-rules step exceed Express' default 100 KB JSON limit.
  app.useBodyParser('json', { limit: '2mb' });

  // Explicit adapter (instead of Nest's dynamic lookup) so single-file bundles keep socket.io.
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Locally-stored uploads (photos for places, chat, etc.) served statically.
  // Swap STORAGE_DRIVER + UploadService implementation to move this to S3 later.
  app.useStaticAssets(process.env.UPLOADS_DIR || join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  const port = config.get<number>('port') || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Guide API listening on http://localhost:${port}`);
}

bootstrap();
