"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:5173',
                'http://localhost:3000',
                'https://nextbyteitinstitute.com',
                'https://www.nextbyteitinstitute.com',
                'https://admin.nextbyteitinstitute.com',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.error(`CORS policy blocked request from: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const port = 8000;
    app.setGlobalPrefix('api');
    await app.listen(port);
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/ini_health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
}
bootstrap();
//# sourceMappingURL=main.js.map