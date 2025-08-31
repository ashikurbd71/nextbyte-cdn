import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): object {
    return {
      message: 'Welcome to NextByte CDN Server',
      version: '1.0.0',
      endpoints: {
        upload: '/api/cdn/upload',
        uploadMultiple: '/api/cdn/upload-multiple',
        listFiles: '/api/cdn/files',
        getFile: '/api/cdn/files/:filename',
        fileInfo: '/api/cdn/info/:filename',
        deleteFile: '/api/cdn/files/:filename',
        stats: '/api/cdn/stats',
        serveFiles: '/files/:filename'
      },
      supportedTypes: {
        images: ['JPEG', 'PNG', 'GIF', 'WebP'],
        videos: ['MP4', 'AVI', 'MOV', 'WMV', 'FLV'],
        documents: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'TXT', 'ZIP', 'RAR']
      },
      maxFileSize: '50MB',
      maxFilesPerUpload: 10
    };
  }

  @Get('ini_health')
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }




}
