import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn'],
    });

    // Open CORS: allow all origins
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: false, // wildcard origin হলে true রাখা যাবে না
    });


    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

if (!process.env.VERCEL) {
  async function startLocalServer() {
    const app = await bootstrap();
    const port = process.env.PORT || 8000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
  }
  startLocalServer();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await bootstrap();
  app.getHttpAdapter().getInstance()(req, res);
}
