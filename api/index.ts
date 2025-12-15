import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedHandler: any;

async function bootstrapHandler() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  // CORS completely open
  app.enableCors({
    origin: '*', // সব origin allow
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','Origin','X-Requested-With'],
    credentials: false, // wildcard origin হলে credentials true রাখা যাবে না
  });

  await app.init();
  return app.getHttpAdapter().getInstance(); // Express instance
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // OPTIONS preflight requests handle
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
    return res.status(204).end();
  }

  if (!cachedHandler) cachedHandler = await bootstrapHandler();

  return cachedHandler(req, res);
};
