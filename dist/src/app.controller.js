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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
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
    getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('ini_health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map