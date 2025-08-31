import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';


@Module({
  imports: [
    // Serve static files from uploads directory with subdirectory support
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/cdn/files',
      serveStaticOptions: {
        index: false,
        cacheControl: true,
        maxAge: 31536000, // 1 year
        setHeaders: (res, path) => {
          // Set appropriate headers for different file types
          if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/' + path.split('.').pop());
          } else if (path.endsWith('.mp4') || path.endsWith('.avi') || path.endsWith('.mov') || path.endsWith('.wmv') || path.endsWith('.flv')) {
            res.setHeader('Content-Type', 'video/' + path.split('.').pop());
          } else if (path.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
          } else if (path.endsWith('.doc') || path.endsWith('.docx')) {
            res.setHeader('Content-Type', 'application/msword');
          } else if (path.endsWith('.xls') || path.endsWith('.xlsx')) {
            res.setHeader('Content-Type', 'application/vnd.ms-excel');
          } else if (path.endsWith('.txt')) {
            res.setHeader('Content-Type', 'text/plain');
          } else if (path.endsWith('.zip')) {
            res.setHeader('Content-Type', 'application/zip');
          } else if (path.endsWith('.rar')) {
            res.setHeader('Content-Type', 'application/x-rar-compressed');
          }
        },
      },
    }),

  ],
  controllers: [AppController, FileUploadController],
  providers: [AppService, FileUploadService],
})
export class AppModule { }
