import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 8000;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

  // Set global prefix for the application
  app.setGlobalPrefix('api');

  await app.listen(port);

  console.log(`🚀 CDN Server is running on: ${baseUrl}`);
  console.log(`📁 File upload endpoint: ${baseUrl}/api/cdn/upload`);
  console.log(`📂 Files served at: ${baseUrl}/api/cdn/files/`);
  console.log(`📋 File info endpoint: ${baseUrl}/api/cdn/info/`);
}
bootstrap();
