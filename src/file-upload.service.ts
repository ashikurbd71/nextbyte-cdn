import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: Date;
    folder: string;
}

@Injectable()
export class FileUploadService {
    private readonly uploadDir = 'uploads';
    private readonly baseUrl = 'https://cdn.nextbyteitinstitute.com';
    private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private readonly allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    private readonly allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ];

    constructor() {
        this.ensureUploadDirectory();
    }

    private ensureUploadDirectory(): void {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        // Create subdirectories for different file types
        const subdirs = ['photos', 'videos', 'documents', 'other'];
        subdirs.forEach(dir => {
            const dirPath = path.join(this.uploadDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }

    private getFileCategory(mimetype: string): string {
        if (this.allowedImageTypes.includes(mimetype)) {
            return 'photos';
        } else if (this.allowedVideoTypes.includes(mimetype)) {
            return 'videos';
        } else if (this.allowedFileTypes.includes(mimetype)) {
            return 'documents';
        } else {
            return 'other';
        }
    }

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const allowedTypes = [
            ...this.allowedImageTypes,
            ...this.allowedVideoTypes,
            ...this.allowedFileTypes
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            throw new BadRequestException('File size exceeds 50MB limit');
        }
    }

    private generateFilename(originalName: string): string {
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const uuid = uuidv4().substring(0, 8);
        return `${name}_${timestamp}_${uuid}${ext}`;
    }

    async uploadFile(file: Express.Multer.File): Promise<FileInfo> {
        this.validateFile(file);

        const filename = this.generateFilename(file.originalname);
        const category = this.getFileCategory(file.mimetype);
        const categoryDir = path.join(this.uploadDir, category);
        const filePath = path.join(categoryDir, filename);

        // Write file to disk in the appropriate category folder
        fs.writeFileSync(filePath, file.buffer);

        const fileInfo: FileInfo = {
            originalName: file.originalname,
            filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `${this.baseUrl}/api/cdn/files/${category}/${filename}`,
            uploadedAt: new Date(),
            folder: category
        };

        return fileInfo;
    }

    async uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileInfo[]> {
        const uploadPromises = files.map(file => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }

    getFileInfo(filename: string): FileInfo | null {
        // Search for file in all category folders
        const categories = ['photos', 'videos', 'documents', 'other'];

        for (const category of categories) {
            const filePath = path.join(this.uploadDir, category, filename);

            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const ext = path.extname(filename);
                const originalName = filename.replace(/_\d+_[a-f0-9]{8}/, '');

                return {
                    originalName,
                    filename,
                    mimetype: this.getMimeType(ext),
                    size: stats.size,
                    url: `${this.baseUrl}/api/cdn/files/${category}/${filename}`,
                    uploadedAt: stats.birthtime,
                    folder: category
                };
            }
        }

        return null;
    }

    private getMimeType(ext: string): string {
        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.avi': 'video/avi',
            '.mov': 'video/mov',
            '.wmv': 'video/wmv',
            '.flv': 'video/flv',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed'
        };

        return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
    }

    deleteFile(filename: string): boolean {
        const categories = ['photos', 'videos', 'documents', 'other'];

        for (const category of categories) {
            const filePath = path.join(this.uploadDir, category, filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
        }

        return false;
    }

    listFiles(): FileInfo[] {
        if (!fs.existsSync(this.uploadDir)) {
            return [];
        }

        const categories = ['photos', 'videos', 'documents', 'other'];
        const allFiles: FileInfo[] = [];

        categories.forEach(category => {
            const categoryPath = path.join(this.uploadDir, category);

            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath);

                files.forEach(filename => {
                    const fileInfo = this.getFileInfo(filename);
                    if (fileInfo) {
                        allFiles.push(fileInfo);
                    }
                });
            }
        });

        return allFiles;
    }

    listFilesByCategory(category?: string): FileInfo[] {
        if (!fs.existsSync(this.uploadDir)) {
            return [];
        }

        if (category) {
            const categoryPath = path.join(this.uploadDir, category);

            if (!fs.existsSync(categoryPath)) {
                return [];
            }

            const files = fs.readdirSync(categoryPath);
            return files
                .map(filename => this.getFileInfo(filename))
                .filter(fileInfo => fileInfo !== null) as FileInfo[];
        }

        return this.listFiles();
    }

    getCategoryStats(): Record<string, { count: number; totalSize: number }> {
        const categories = ['photos', 'videos', 'documents', 'other'];
        const stats: Record<string, { count: number; totalSize: number }> = {};

        categories.forEach(category => {
            const files = this.listFilesByCategory(category);
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);

            stats[category] = {
                count: files.length,
                totalSize
            };
        });

        return stats;
    }



}
