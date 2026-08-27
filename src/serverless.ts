import 'reflect-metadata';
import type { IncomingMessage, ServerResponse } from 'http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { AppModule } from './app.module';

// Vercel serverless entry point. Unlike main.ts (local dev, `app.listen()`), this never binds
// a port — it hands request/response objects straight to the underlying Express instance,
// which Vercel invokes per request. The Nest app is built once per warm function instance and
// reused across invocations (module-scope cache), same idea as `app.listen()` staying up.
const server = express();
let appReady: Promise<unknown> | null = null;

async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { cors: false });
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // No static /uploads here — STORAGE_DRIVER=vercel-blob serves photos straight from Blob's
  // own CDN URL, and the function's filesystem isn't persistent across invocations anyway.

  await app.init();
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appReady) appReady = createApp();
  await appReady;
  server(req, res);
}
