"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
let cachedHandler;
async function bootstrapHandler() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn'] });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        credentials: false,
    });
    await app.init();
    return app.getHttpAdapter().getInstance();
}
exports.default = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
        return res.status(204).end();
    }
    if (!cachedHandler)
        cachedHandler = await bootstrapHandler();
    return cachedHandler(req, res);
};
//# sourceMappingURL=index.js.map