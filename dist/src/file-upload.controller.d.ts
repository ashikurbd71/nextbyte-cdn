import { Response as ExpressResponse } from 'express';
import { FileUploadService, FileInfo } from './file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadFile(file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: FileInfo;
    }>;
    uploadMultipleFiles(files: Express.Multer.File[]): Promise<{
        success: boolean;
        message: string;
        data: FileInfo[];
    }>;
    serveFile(category: string, filename: string, res: ExpressResponse): Promise<void>;
    listFiles(category?: string): Promise<{
        success: boolean;
        message: string;
        data: FileInfo[];
    }>;
    getFileInfo(filename: string): Promise<{
        success: boolean;
        message: string;
        data: FileInfo;
    }>;
    getStats(): Promise<{
        success: boolean;
        message: string;
        data: Record<string, {
            count: number;
            totalSize: number;
        }>;
    }>;
    deleteFile(filename: string): Promise<{
        success: boolean;
        message: string;
        data: {
            filename: string;
        };
    }>;
}
