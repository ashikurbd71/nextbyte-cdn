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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_service_1 = require("./file-upload.service");
const fs = require("fs");
let FileUploadController = class FileUploadController {
    fileUploadService;
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadFile(file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            const fileInfo = await this.fileUploadService.uploadFile(file);
            return {
                success: true,
                message: 'File uploaded successfully',
                data: fileInfo
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async uploadMultipleFiles(files) {
        try {
            if (!files || files.length === 0) {
                throw new common_1.BadRequestException('No files uploaded');
            }
            if (files.length > 10) {
                throw new common_1.BadRequestException('Maximum 10 files allowed per upload');
            }
            const fileInfos = await this.fileUploadService.uploadMultipleFiles(files);
            return {
                success: true,
                message: `${files.length} files uploaded successfully`,
                data: fileInfos
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async serveFile(category, filename, res) {
        try {
            if (!filename || filename.trim() === '') {
                throw new common_1.BadRequestException('Filename is required');
            }
            if (!category || category.trim() === '') {
                throw new common_1.BadRequestException('Category is required');
            }
            const fileInfo = this.fileUploadService.getFileInfo(filename);
            if (!fileInfo) {
                throw new common_1.NotFoundException('File not found');
            }
            if (fileInfo.folder !== category) {
                throw new common_1.NotFoundException('File not found in specified category');
            }
            const filePath = this.fileUploadService.getAbsoluteFilePath(fileInfo.folder, filename);
            if (!fs.existsSync(filePath)) {
                throw new common_1.NotFoundException('File not found on disk');
            }
            res.set({
                'Content-Type': fileInfo.mimetype,
                'Content-Disposition': `inline; filename="${fileInfo.originalName}"`,
                'Cache-Control': 'public, max-age=31536000'
            });
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async listFiles(category) {
        try {
            const files = this.fileUploadService.listFilesByCategory(category);
            return {
                success: true,
                message: 'Files retrieved successfully',
                data: files
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getFileInfo(filename) {
        try {
            if (!filename || filename.trim() === '') {
                throw new common_1.BadRequestException('Filename is required');
            }
            const fileInfo = this.fileUploadService.getFileInfo(filename);
            if (!fileInfo) {
                throw new common_1.NotFoundException('File not found');
            }
            return {
                success: true,
                message: 'File info retrieved successfully',
                data: fileInfo
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getStats() {
        try {
            const stats = this.fileUploadService.getCategoryStats();
            return {
                success: true,
                message: 'Statistics retrieved successfully',
                data: stats
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deleteFile(filename) {
        try {
            if (!filename || filename.trim() === '') {
                throw new common_1.BadRequestException('Filename is required');
            }
            const deleted = this.fileUploadService.deleteFile(filename);
            if (!deleted) {
                throw new common_1.NotFoundException('File not found');
            }
            return {
                success: true,
                message: 'File deleted successfully',
                data: { filename }
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('files/:category/:filename'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "serveFile", null);
__decorate([
    (0, common_1.Get)('files'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)('files/info/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFileInfo", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)('files/:filename'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('cdn'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map