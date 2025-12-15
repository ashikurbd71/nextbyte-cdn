"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const file_upload_controller_1 = require("./file-upload.controller");
const file_upload_service_1 = require("./file-upload.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/api/cdn/files',
                serveStaticOptions: {
                    index: false,
                    cacheControl: true,
                    maxAge: 31536000,
                    setHeaders: (res, path) => {
                        if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.webp')) {
                            res.setHeader('Content-Type', 'image/' + path.split('.').pop());
                        }
                        else if (path.endsWith('.mp4') || path.endsWith('.avi') || path.endsWith('.mov') || path.endsWith('.wmv') || path.endsWith('.flv')) {
                            res.setHeader('Content-Type', 'video/' + path.split('.').pop());
                        }
                        else if (path.endsWith('.pdf')) {
                            res.setHeader('Content-Type', 'application/pdf');
                        }
                        else if (path.endsWith('.doc') || path.endsWith('.docx')) {
                            res.setHeader('Content-Type', 'application/msword');
                        }
                        else if (path.endsWith('.xls') || path.endsWith('.xlsx')) {
                            res.setHeader('Content-Type', 'application/vnd.ms-excel');
                        }
                        else if (path.endsWith('.txt')) {
                            res.setHeader('Content-Type', 'text/plain');
                        }
                        else if (path.endsWith('.zip')) {
                            res.setHeader('Content-Type', 'application/zip');
                        }
                        else if (path.endsWith('.rar')) {
                            res.setHeader('Content-Type', 'application/x-rar-compressed');
                        }
                    },
                },
            }),
        ],
        controllers: [app_controller_1.AppController, file_upload_controller_1.FileUploadController],
        providers: [app_service_1.AppService, file_upload_service_1.FileUploadService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map