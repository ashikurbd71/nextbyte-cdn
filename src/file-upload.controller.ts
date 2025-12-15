import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Res,
    NotFoundException,
    BadRequestException,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { FileUploadService, FileInfo } from './file-upload.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('cdn')
export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) { }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        try {
            if (!file) {
                throw new BadRequestException('No file uploaded');
            }

            const fileInfo = await this.fileUploadService.uploadFile(file);
            return {
                success: true,
                message: 'File uploaded successfully',
                data: fileInfo
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }

    @Post('upload-multiple')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
        try {
            if (!files || files.length === 0) {
                throw new BadRequestException('No files uploaded');
            }

            if (files.length > 10) {
                throw new BadRequestException('Maximum 10 files allowed per upload');
            }

            const fileInfos = await this.fileUploadService.uploadMultipleFiles(files);
            return {
                success: true,
                message: `${files.length} files uploaded successfully`,
                data: fileInfos
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }


    @Get('files/:category/:filename')
    async serveFile(
        @Param('category') category: string,
        @Param('filename') filename: string,
        @Res() res: ExpressResponse
    ) {
        try {
            if (!filename || filename.trim() === '') {
                throw new BadRequestException('Filename is required');
            }

            if (!category || category.trim() === '') {
                throw new BadRequestException('Category is required');
            }

            const fileInfo = this.fileUploadService.getFileInfo(filename);

            if (!fileInfo) {
                throw new NotFoundException('File not found');
            }

            // Verify the category matches
            if (fileInfo.folder !== category) {
                throw new NotFoundException('File not found in specified category');
            }

            // Resolve the absolute path using the upload service so it stays consistent
            const filePath = this.fileUploadService.getAbsoluteFilePath(fileInfo.folder, filename);

            if (!fs.existsSync(filePath)) {
                throw new NotFoundException('File not found on disk');
            }

            // Set appropriate headers
            res.set({
                'Content-Type': fileInfo.mimetype,
                'Content-Disposition': `inline; filename="${fileInfo.originalName}"`,
                'Cache-Control': 'public, max-age=31536000' // 1 year cache
            });

            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res as any);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }

    @Get('files')
    async listFiles(@Query('category') category?: string) {
        try {
            const files = this.fileUploadService.listFilesByCategory(category);
            return {
                success: true,
                message: 'Files retrieved successfully',
                data: files
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('files/info/:filename')
    async getFileInfo(@Param('filename') filename: string) {
        try {
            if (!filename || filename.trim() === '') {
                throw new BadRequestException('Filename is required');
            }

            const fileInfo = this.fileUploadService.getFileInfo(filename);

            if (!fileInfo) {
                throw new NotFoundException('File not found');
            }

            return {
                success: true,
                message: 'File info retrieved successfully',
                data: fileInfo
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }

    @Get('stats')
    async getStats() {
        try {
            const stats = this.fileUploadService.getCategoryStats();
            return {
                success: true,
                message: 'Statistics retrieved successfully',
                data: stats
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete('files/:filename')
    @HttpCode(HttpStatus.OK)
    async deleteFile(@Param('filename') filename: string) {
        try {
            if (!filename || filename.trim() === '') {
                throw new BadRequestException('Filename is required');
            }

            const deleted = this.fileUploadService.deleteFile(filename);

            if (!deleted) {
                throw new NotFoundException('File not found');
            }

            return {
                success: true,
                message: 'File deleted successfully',
                data: { filename }
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }


}
