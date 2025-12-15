"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
let FileUploadService = class FileUploadService {
    uploadDir = process.env.UPLOAD_DIR ||
        (process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'uploads'));
    baseUrl = 'https://cdn.nextbyteitinstitute.com';
    allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    allowedFileTypes = [
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
    ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        const subdirs = ['photos', 'videos', 'documents', 'other'];
        subdirs.forEach(dir => {
            const dirPath = path.join(this.uploadDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }
    getAbsoluteFilePath(folder, filename) {
        return path.join(this.uploadDir, folder, filename);
    }
    getFileCategory(mimetype) {
        if (this.allowedImageTypes.includes(mimetype)) {
            return 'photos';
        }
        else if (this.allowedVideoTypes.includes(mimetype)) {
            return 'videos';
        }
        else if (this.allowedFileTypes.includes(mimetype)) {
            return 'documents';
        }
        else {
            return 'other';
        }
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = [
            ...this.allowedImageTypes,
            ...this.allowedVideoTypes,
            ...this.allowedFileTypes
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
    }
    generateFilename(originalName) {
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)().substring(0, 8);
        return `${name}_${timestamp}_${uuid}${ext}`;
    }
    async uploadFile(file) {
        this.validateFile(file);
        const filename = this.generateFilename(file.originalname);
        const category = this.getFileCategory(file.mimetype);
        const categoryDir = path.join(this.uploadDir, category);
        const filePath = path.join(categoryDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const fileInfo = {
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
    async uploadMultipleFiles(files) {
        const uploadPromises = files.map(file => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }
    getFileInfo(filename) {
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
    getMimeType(ext) {
        const mimeTypes = {
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
    deleteFile(filename) {
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
    listFiles() {
        if (!fs.existsSync(this.uploadDir)) {
            return [];
        }
        const categories = ['photos', 'videos', 'documents', 'other'];
        const allFiles = [];
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
    listFilesByCategory(category) {
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
                .filter(fileInfo => fileInfo !== null);
        }
        return this.listFiles();
    }
    getCategoryStats() {
        const categories = ['photos', 'videos', 'documents', 'other'];
        const stats = {};
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
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map