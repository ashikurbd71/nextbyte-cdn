import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Hardcoded allowed origins
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://nextbyteitinstitute.com',
        'https://www.nextbyteitinstitute.com',
        'https://admin.nextbyteitinstitute.com',

      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        console.error(`CORS policy blocked request from: ${origin}`); // Log blocked origins for debugging
        callback(new Error('Not allowed by CORS')); // Deny the request
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow sending cookies
  });

  const port = 8000;


  // Set global prefix for the application
  app.setGlobalPrefix('api');

  await app.listen(port);

  // Add a raw route using the underlying HTTP adapter
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/ini_health', (req, res) => {
    res.status(200).json({
      status: 'healthy', // Simple health indicator
      timestamp: new Date().toISOString(), // Current server time
      uptime: process.uptime(), // Process uptime in seconds
    });
  });

}
bootstrap();
