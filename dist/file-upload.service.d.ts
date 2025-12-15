export interface FileInfo {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: Date;
    folder: string;
}
export declare class FileUploadService {
    private readonly uploadDir;
    private readonly baseUrl;
    private readonly allowedImageTypes;
    private readonly allowedVideoTypes;
    private readonly allowedFileTypes;
    constructor();
    private ensureUploadDirectory;
    private getFileCategory;
    private validateFile;
    private generateFilename;
    uploadFile(file: Express.Multer.File): Promise<FileInfo>;
    uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileInfo[]>;
    getFileInfo(filename: string): FileInfo | null;
    private getMimeType;
    deleteFile(filename: string): boolean;
    listFiles(): FileInfo[];
    listFilesByCategory(category?: string): FileInfo[];
    getCategoryStats(): Record<string, {
        count: number;
        totalSize: number;
    }>;
}
